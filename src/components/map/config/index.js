import { wgs84togcj02, gcj02towgs84 } from '../gpsconvert/gpsConvert';
import 'proj4leaflet';
import { PGISTileLayer } from '../layer/index';
import { TileLayer } from 'react-leaflet';

const { L } = window;
const reslutions = (() => {
  const res = 0.70312500015485435;
  const arr = [];
  let count = 0;
  while (count < 20) {
    arr.push(res / Math.pow(2, count));
    count++;
  }
  arr[10] = 0.0007332427165148582;
  let i = 11;
  while (i < 20) {
    // 只有arr[10] - arr[19] 這一段分辨率用到了
    arr[i] = arr[i - 1] / 2;
    i++;
  }
  return arr;
})();
const pgis_crs = new L.Proj.CRS(
  'EPSG:4326',
  '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees',
  {
    resolutions: reslutions,
    origin: [118, 31],
    bounds: L.bounds([-180, -85.05112878], [180, 85.05112878]),
  },
);

const pgis = {
  crs: pgis_crs,
  minZoom: 10,
  maxZoom: 18,
  initZoom: 12,
  mapUrl: `https://dtfw2.hzos.hzs.zj/map/qqbmapcenter/gonganlan/china/zhejiang/hangzhou/hangzhouquanshi/pgis/vec/Layers/_alllayers/{z}/{y}/{x}.png`, // https://dtfw2.hzos.hzs.zj //市局pgis 地址
  wgs84togcj02: (lon, lat) => [lat, lon],
  gcj02towgs84: (lon, lat) => [lat, lon],
  TileLayer: PGISTileLayer,
  zOffset: 1,
};

const amap = {
  crs: L.CRS.EPSG3857,
  minZoom: 0,
  maxZoom: 18,
  initZoom: 17,
  // mapUrl: 'https://xlbw-ca.hzos.hzs.zj/v3/tile?z={z}&x={x}&y={y}', // 公司环境
  mapUrl: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
  // mapUrl: 'http://192.168.3.229:8080/amap/{z}/{x}/{y}.png', // 公司环境
  // mapUrl: `http://localhost:800/geoserver/gwc/service/tms/1.0.0/chinaosm%3Aosm@EPSG%3A900913@png/{z}/{x}/{-y}.png`, // 市局
  // mapUrl: `${process.env.mapRootUrl}/amap/{z}/{x}/{y}.png`, // 市局
  wgs84togcj02,
  gcj02towgs84,
  TileLayer,
};

export { pgis, amap };
