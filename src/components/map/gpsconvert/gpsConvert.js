/* eslint-disable*/
/*
 * BD-09：百度坐标系(百度地图)
 * GCJ-02：火星坐标系（谷歌中国地图、高德地图）
 * WGS84：地球坐标系（国际通用坐标系，谷歌地图）
 */

const x_PI = (3.14159265358979324 * 3000.0) / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

// 百度坐标系转火星坐标系
function bd09togcj02(bd_lon, bd_lat) {
  const x = bd_lon - 0.0065;
  const y = bd_lat - 0.006;
  const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
  const theta = Math.Atan2(y, x) - 0.000003 * Math.cos(x * x_PI);

  const gcj_lon = z * Math.cos(theta);
  const gcj_lat = z * Math.sin(theta);
  const gcj = [gcj_lon, gcj_lat]; // 火星坐标系值

  // 火星坐标系转wgs84
  const wgs = [gcj02towgs84(gcj[0], gcj[1])];
  return wgs;
}

// 火星坐标系转wgs84
export function gcj02towgs84(gcj_lon, gcj_lat) {
  gcj_lon = Number(gcj_lon);
  gcj_lat = Number(gcj_lat);
  if (out_of_china(gcj_lon, gcj_lat)) {
    // 不在国内，不进行纠偏
    const back = { gcj_lon, gcj_lat };
    return back;
  } else {
    let dlon = transformlon(gcj_lon - 105.0, gcj_lat - 35.0);
    let dlat = transformlat(gcj_lon - 105.0, gcj_lat - 35.0);
    const radlat = (gcj_lat / 180.0) * PI;
    let magic = Math.sin(radlat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dlon = (dlon * 180.0) / ((a / sqrtmagic) * Math.cos(radlat) * PI);
    dlat = (dlat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
    const mglon = gcj_lon + dlon;
    const mglat = gcj_lat + dlat;
    const wgs_lon = gcj_lon * 2 - mglon;
    const wgs_lat = gcj_lat * 2 - mglat;
    const wgs = [wgs_lat, wgs_lon]; // wgs84坐标系值
    return wgs;
  }
}

// 火星坐标系转百度坐标系
function gcj02tobd09(gcj_lon, gcj_lat) {
  const z = Math.sqrt(gcj_lon * gcj_lon + gcj_lat * gcj_lat) + 0.00002 * Math.sin(gcj_lat * x_PI);
  const theta = Math.atan2(gcj_lat, gcj_lon) + 0.000003 * Math.cos(gcj_lon * x_PI);
  const bd_lon = z * Math.cos(theta) + 0.0065;
  const bd_lat = z * Math.sin(theta) + 0.006;
  const bd = [bd_lon, bd_lat];
  return bd;
}

// wgs84转火星坐标系
export function wgs84togcj02(wgs_lon, wgs_lat) {
  wgs_lon = Number(wgs_lon);
  wgs_lat = Number(wgs_lat);
  if (process.env.isPgis) return [wgs_lat, wgs_lon];

  if (out_of_china(wgs_lon, wgs_lat)) {
    // 不在国内
    const back = [wgs_lon, wgs_lat];
    return back;
  } else {
    let dwgs_lon = transformlon(wgs_lon - 105.0, wgs_lat - 35.0);
    let dwgs_lat = transformlat(wgs_lon - 105.0, wgs_lat - 35.0);
    const radwgs_lat = (wgs_lat / 180.0) * PI;
    let magic = Math.sin(radwgs_lat);
    magic = 1 - ee * magic * magic;
    const sqrtmagic = Math.sqrt(magic);
    dwgs_lon = (dwgs_lon * 180.0) / ((a / sqrtmagic) * Math.cos(radwgs_lat) * PI);
    dwgs_lat = (dwgs_lat * 180.0) / (((a * (1 - ee)) / (magic * sqrtmagic)) * PI);
    const gcj_lon = wgs_lon + dwgs_lon;
    const gcj_lat = wgs_lat + dwgs_lat;
    const gcj = [gcj_lat, gcj_lon];
    return gcj;
  }
}

function transformlon(lon, lat) {
  let ret =
    300.0 + lon + 2.0 * lat + 0.1 * lon * lon + 0.1 * lon * lat + 0.1 * Math.sqrt(Math.abs(lon));
  ret += ((20.0 * Math.sin(6.0 * lon * PI) + 20.0 * Math.sin(2.0 * lon * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lon * PI) + 40.0 * Math.sin((lon / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((lon / 12.0) * PI) + 300.0 * Math.sin((lon / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

function transformlat(lon, lat) {
  let ret =
    -100.0 +
    2.0 * lon +
    3.0 * lat +
    0.2 * lat * lat +
    0.1 * lon * lat +
    0.2 * Math.sqrt(Math.abs(lon));
  ret += ((20.0 * Math.sin(6.0 * lon * PI) + 20.0 * Math.sin(2.0 * lon * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(lat * PI) + 40.0 * Math.sin((lat / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((lat / 12.0) * PI) + 320 * Math.sin((lat * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

// 判断是否在国内，不在国内则不做偏移
function out_of_china(lon, lat) {
  return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271 || false;
}

// 1.加密解密方法使用：

// 1.加密
// var str = '124中文内容';
// var base = new Base64();
// var result = base.encode(str);
// document.write(result);

// 2.解密
// var result2 = base.decode(result);
// document.write(result2);
// 2.加密、解密算法封装：

function Base64() {
  // private property
  _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  // public method for encoding
  this.encode = function(input) {
    let output = '';
    let chr1;
    let chr2;
    let chr3;
    let enc1;
    let enc2;
    let enc3;
    let enc4;
    let i = 0;
    input = _utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output =
        output +
        _keyStr.charAt(enc1) +
        _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) +
        _keyStr.charAt(enc4);
    }
    return output;
  };

  // public method for decoding
  this.decode = function(input) {
    let output = '';
    let chr1;
    let chr2;
    let chr3;
    let enc1;
    let enc2;
    let enc3;
    let enc4;
    let i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output += String.fromCharCode(chr1);
      if (enc3 != 64) {
        output += String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output += String.fromCharCode(chr3);
      }
    }
    output = _utf8_decode(output);
    return output;
  };

  // private method for UTF-8 encoding
  _utf8_encode = function(string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';
    for (let n = 0; n < string.length; n++) {
      const c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  };

  // private method for UTF-8 decoding
  _utf8_decode = function(utftext) {
    let string = '';
    let i = 0;
    let c = (c1 = c2 = 0);
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  };
}
