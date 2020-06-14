/* eslint-disable */
import {
  PruneCluster,
  PruneClusterForLeaflet,
} from 'exports-loader?PruneCluster,PruneClusterForLeaflet!prunecluster/dist/PruneCluster.js';
import {
  videoIcon,
  videoPointIcon,
  videoSelectedIcon,
  videoPlayerMap,
  faceIcon,
  itcIcon,
  carIcon,
  faceClickedIcon,
  carClickedIcon,
  state,
} from '@/components/map/constant';
import VideoPlayerRTMP from '../../video/index-rtmp';
import VideoPlayerFLV from '../../video/index-flv';
import { videoClickedIcon } from '../constant/index';
import ReactDOM from 'react-dom';
import { createRef } from 'react';
import { message } from 'antd';
import pointsWithinPolygon from '@turf/points-within-polygon';
import * as turf from '@turf/helpers';
import CircleSelect from '../select/circle';

let clickMarker = null;
let videoTimeOut = null;
let markerGroup = [];
let videoPlayerRef = null;
let g_deviceId = null;
let sessionId = null;
let dispatch = () => {};
let _map = null;
let closeTime = null;
let setCenter = () => {};
let markerClickedTime = '';
let tmpMarker = null;
let leafletViewList = [null, null, null];
var pane1 = null;
var pane2 = null;
var pane3 = null;
const videoClusterClassName = 'marker-cluster-video';
const faceClusterClassName = 'marker-cluster-faceITC';
const carClusterClassName = 'marker-cluster-carITC';
let panelist = null;
let parent; // 当前地图上所有的设备点位
let tempMarkers = []; // 临时点位
let tempLeafletView = null; // 临时聚散单位

const addMessage = content => {
  message.destroy();
  message.info(content, 3);
};
export const createMarkers = (
  markerList,
  map,
  mapSelectData,
  _markerGroup,
  _videoPlayerRef,
  _dispatch,
  _setCenter,
  _deviceType, // 视频 0，人脸 1，车辆 2
  _parent,
) => {
  markerGroup = _markerGroup;
  videoPlayerRef = _videoPlayerRef;
  dispatch = _dispatch;
  setCenter = _setCenter;
  parent = _parent;
  _map = map;
  pane1 = pane1 || _map.createPane('markers0'); // 与样式表.leaflet-markers0-pane 对应
  pane2 = pane2 || _map.createPane('markers1'); // 与样式表.leaflet-markers1-pane 对应
  pane3 = pane3 || _map.createPane('markers2'); // 与样式表.leaflet-markers2-pane 对应
  panelist = panelist || [pane1, pane2, pane3];
  // _map.off('layeradd', clusterMarkerAdded).on('layeradd', clusterMarkerAdded);
  let leafletView = leafletViewList[_deviceType];
  if (leafletView) {
    leafletView
      .GetMarkers()
      .forEach(marker => (markerGroup[marker.data.attribution.data.deviceId] = null));
    leafletView.remove();
  }
  leafletView = new PruneClusterForLeaflet();
  !map.hasLayer(leafletView) && map.addLayer(leafletView);
  markerList.map(item => {
    // const popup = L.popup({
    //   className: 'video-popup',
    //   closeOnClick: closeVideoPopup,
    // }).setContent(`<div className="title">{item.deviceName}</div>
    //                <VideoPlayer {...item.videoJsOptions} ref={videoPlayerRef} />`);
    var marker = new PruneCluster.Marker(...item.position, {
      icon: getIcon(item, mapSelectData),
      attribution: item,
      pane: panelist[_deviceType],
      mapSelectData,
    });
    leafletView.RegisterMarker(marker);
  });

  leafletView.PrepareLeafletMarker = function(leafletMarker, data) {
    const props = data.attribution.data;
    const { deviceId, deviceName } = props;
    leafletMarker.options.pane = data.pane;
    leafletMarker.options.title = deviceName;
    const icon = deviceId === g_deviceId ? getIcon(props, [], true) : data.icon;
    leafletMarker
      .setIcon(icon)
      .off('click')
      .on('click', e => markerClickHandler({ data: { ...data, ...e }, leafletMarker }));
    markerGroup[deviceId] = leafletMarker;
  };
  leafletView.__BuildLeafletCluster = leafletView.BuildLeafletCluster;
  leafletView.BuildLeafletCluster = function(cluster, data) {
    const clusterMarker = leafletView.__BuildLeafletCluster(cluster, data);
    clusterMarker.options.pane = cluster.lastMarker.data.pane;
    setClusterMarkerTitle(clusterMarker);
    return clusterMarker;
  };
  leafletView.BuildLeafletClusterIcon = function(cluster) {
    if (cluster && cluster.data && cluster.data._leafletMarker) {
      // cluster.data._leafletMarker.setOpacity(0.5);
    }
    const count = cluster.population;
    const { szType, deviceType } = cluster.lastMarker.data.attribution.data;
    const className =
      szType === 1
        ? videoClusterClassName
        : deviceType + '' === '1' || deviceType + '' === ''
        ? faceClusterClassName
        : carClusterClassName;

    return L.divIcon({
      html: `<span>${
        count > 9999 ? '<span style="padding-left:0.01rem;">9999+</span>' : count
      }</span>`,
      // className: count > 999 ? 'marker-cluster-custom-12' : 'marker-cluster-custom',
      // iconSize: L.point(32, 32, true),
      className,
      iconSize: L.point(65, 25, true),
    });
  };
  leafletView.ProcessView();
  setTimeout(() => {
    leafletView
      .GetMarkers()
      .forEach(marker => (markerGroup[marker.data.attribution.data.deviceId] = marker));
    leafletViewList[_deviceType] = leafletView;
  }, 100);
};
/**
 * 显示图层
 * @param type 0 视频， 1 人脸， 2 卡口
 */
export const showLayer = type => {
  if (type > 2) return;
  const ly = leafletViewList[type];
  if (_map && ly && !_map.hasLayer(ly)) {
    _map.addLayer(ly);
  }
};
/**
 * 隐藏图层
 * @param type 0 视频， 1 人脸， 2 卡口
 */
export const hideLayer = type => {
  if (type > 2) return;
  const ly = leafletViewList[type];
  if (_map && _map.hasLayer(ly)) {
    ly.remove();
  }
};
/**
 * 设置设备透明度
 * @param type 0 视频， 1 人脸， 2 卡口
 * @param value 透明度值
 * @param isFromMap 是否是通过图例checkBox控件传入
 */
export const setOpacity = (type, value, isFromMap = false) => {
  if (type >= 0 && type <= 2 && panelist && panelist.length === 3) {
    const opacity = panelist[type].style.opacity; //  = value;
    if (isFromMap) {
      panelist[type].style.opacity = value;
    } else {
      const no = Number(opacity);
      if (no !== 0 || opacity === '') {
        const sum = Number(value) + no;
        if (sum !== 1) {
          // 不允许除单击控件外的地方，直接打开或隐藏图层
          panelist[type].style.opacity = value;
        }
      }
    }
  }
};
/**
 * 清除所有设备点位
 */
export const clearFlascluster = () => {
  leafletViewList.forEach(item => {
    item && item.remove();
  });
  leafletViewList = [null, null, null];
  panelist = null;
  pane1 = null;
  pane2 = null;
  pane3 = null;
};

const clusterMarkerAdded = e => {
  if (e.layer.options && e.layer.options.icon) {
    const { className } = e.layer.options.icon.options;
    if (className === videoClusterClassName) {
      e.layer.options.pane = panelist[0];
    } else if (className === faceClusterClassName) {
      e.layer.options.pane = panelist[1];
    } else if (className === carClusterClassName) {
      e.layer.options.pane = panelist[2];
    }
  }
};

const setClusterMarkerTitle = clusterMarker => {
  if (clusterMarker && clusterMarker.options && clusterMarker.options.icon) {
    const { className } = clusterMarker.options.icon.options;
    if (className === videoClusterClassName) {
      clusterMarker.options.title = '视频点位';
    } else if (className === faceClusterClassName) {
      clusterMarker.options.title = '人脸卡口';
    } else if (className === carClusterClassName) {
      clusterMarker.options.title = '车辆卡口';
    }
  }
};

const getIcon = (item, selectData, bClicked = false) => {
  const exist = selectData && selectData.find(d => d.deviceId === item.data.deviceId);
  const video = bClicked ? videoClickedIcon : videoIcon;
  const face = bClicked ? faceClickedIcon : faceIcon;
  const car = bClicked ? carClickedIcon : carIcon;
  return selectData.length === 0 || exist
    ? item.data.szType === 1
      ? video
      : item.data.deviceType + '' === '1' || item.data.deviceType + '' === ''
      ? face
      : car
    : videoPointIcon;
};

/**
 * 摄像头点位单击响应函数
 * @param e
 */
export const markerClickHandler = ({ data, leafletMarker }) => {
  if (data.attribution.data && data.attribution.data.szType !== 1) return;
  const e = data;
  let marker = leafletMarker;
  // 清除旧临时点位
  if (tmpMarker) {
    tmpMarker && _map.removeLayer(tmpMarker);
    tmpMarker = null;
  }
  if (!leafletMarker) {
    const icon = data.icon || getIcon(e.attribution, []);
    marker = L.marker(data.attribution.position, { icon }).addTo(parent.map);
    tmpMarker = marker;
  } else {
    if (!parent.map.hasLayer(leafletMarker)) {
      parent.map.addLayer(leafletMarker);
    }
  }
  if (markerClickedTime === '') {
    markerClickedTime = new Date().getTime();
  } else {
    const timeInterval = (new Date().getTime() - markerClickedTime) / 1000;
    if (timeInterval < 2) {
      addMessage('2秒之内不能重复播放视频!');
      return;
    }
  }
  const mapSelectData = e.mapSelectData;
  if (clickMarker) {
    // let b = false;
    // if (mapSelectData) {
    //   b = mapSelectData.find(item => item.deviceId === this.clickMarker.deviceId);
    // }
    const icon = getIcon(clickMarker.data.attribution, mapSelectData);
    clickMarker.setIcon(icon);
  }
  const attr = e.attribution;
  const deviceId = attr.data.deviceId;
  const lat = Number(attr.data.latitude) + 0.00065;
  const videoDivId = 'videoPopupDiv-' + new Date().getTime() + '-' + deviceId; // 视频播放DIV的ID
  // setCenter(30.2, 120.25);
  setCenter(lat, attr.data.longitude);
  // setDeviceListIcon([attr.data], videoClickedIcon);
  // 设置播放参数l
  // const url = attr.data.playUrl;
  if (videoTimeOut) {
    clearTimeout(videoTimeOut);
  }

  // const marker = markerGroup[attr.data.deviceId].current.leafletElement;
  if (marker.options.popup) {
    marker.options.popup = null;
    return;
  }
  const popupContent = `<div><div class="title">${attr.data.deviceName ||
    attr.data.name}</div><div id=${videoDivId}></div></div>`;
  const clickedIcon = videoClickedIcon; //getIcon(data.attribution, mapSelectData, true);
  marker &&
    marker
      .setIcon(clickedIcon)
      .unbindPopup()
      .bindPopup(popupContent, { className: 'video-popup' })
      .openPopup()
      .off('popupclose', closeVideoPopup)
      .on('popupclose', closeVideoPopup);
  marker.options.popup = true;
  videoPlayerRef = createRef();

  const isSameId = deviceId === g_deviceId;
  const timePlus = new Date().getTime() - closeTime;
  const addTime = isSameId && timePlus < 3000 ? 3000 : 0;
  ReactDOM.render(
    <VideoPlayerFLV ref={videoPlayerRef} {...state.videoJsOptions} />,
    document.getElementById(videoDivId),
  );

  setTimeout(() => {
    // const type = e.isplayback ? 'map/videoPlayBacksStart' : 'map/videoPlayBacksStop';
    // const time = e.timestamp;
    dispatch({
      type: 'map/videoPlayBacksStart',
      payload: { deviceId },
    }).then(res => {
      if (res.code === '200' || res.message === '成功') {
        // const res = {data: [{playUrl: 'https://mister-ben.github.io/videojs-flvjs/bbb.flv'}]};
        const { current } = videoPlayerRef;
        let { player } = current;
        const oldPlayer = videoPlayerMap.get(attr.data.deviceId);
        if (!oldPlayer && player) {
          videoPlayerMap.set(attr.data.deviceId, current.player);
        }
        // player = oldPlayer || player;
        const oriurl = res.data;
        // 'rtmp://58.200.131.2:1935/livetv/hunantv';
        // 'http://edge.flowplayer.org/flowplayer-700.flv';
        // 'https://mister-ben.github.io/videojs-flvjs/bbb.flv';
        if (!res.data || !res.data || oriurl == '') {
          addMessage('服务器拉流失败，请联系管理员！11111', 3);
        } else {
          const url = oriurl;
          // const url = dealWithURl(oriurl);
          // ----------------------记录点击过的摄像头ID和路线点播sessionId-------------this赋值标记------------------
          g_deviceId = deviceId;
          sessionId = res.data[0].sessionId;
          videoTimeOut = setTimeout(() => {
            // console.log(`url=${url}`, new Date().toString());
            const isOpen = marker.getPopup().isOpen();
            if (isOpen && player) {
              player.clearTimeout();
              current.setId(attr.data.deviceId);
              player.techName_ = null;
              if (oldPlayer) {
                current.setState({ url });
                current.componentDidMount();
              }
              // const videoType = url.indexOf('rtmp:') === -1 ? 'video/x-flv' : 'rtmp/flv';
              const videoType = 'video/x-flv';
              player.src({
                src: url,
                type: videoType,
                language: 'zh-CN',
              });
            }
          }, 100 + addTime);
        }
      } else {
        addMessage('服务器拉流失败，请联系管理员！2222', 3);
      }
    });
  }, addTime);
  // ----------------------记录点击过的摄像头-------------this赋值标记------------------
  clickMarker = marker;
  clickMarker.data = data;
};

const dealWithURl = url => {
  const pre = 'https://41.196.9.16:7443';
  if (url.indexOf('.flv') > -1) {
    const index1 = url.lastIndexOf(':');
    const index2 = url.slice(index1).indexOf('/');
    return pre + url.slice(index1 + index2);
  }
  return url;
};

const closeVideoPopup = e => {
  const deviceId = g_deviceId;
  // const sessionId = sessionId;
  // const type = sessionId ? 'map/videoPlayBacksStart' : 'map/videoPlayBacksStop';
  // const payload = sessionId ? { deviceId, sessionId } : { deviceId };
  e.target.options.popup = null;
  dispatch({
    type: 'map/videoPlayBacksStop',
    payload: { deviceId },
  });
  //   .then(res => {
  //   if (res && (res.errorCode === 'SUCCESS' || res.message === '成功')) {
  //     // console.log('视频已关闭deviceId:', deviceId);
  //   }
  // });

  if (tmpMarker) {
    // setTimeout(() => {
    tmpMarker && _map.removeLayer(tmpMarker);
    tmpMarker = null;
    // }, 100);
  } else {
    clickMarker &&
      clickMarker.setIcon(getIcon(clickMarker.data.attribution, clickMarker.data.mapSelectData));
  }
  if (videoPlayerRef && videoPlayerRef.current) {
    videoPlayerRef.current.componentWillUnmount();
  }
  closeTime = new Date().getTime();
  // console.log('video close time is', new Date());
};

/**
 * 设置摄像头选中状态
 */
const setDeviceListIcon = (deviceList, icon) => {
  setTimeout(() => {
    if (!Array.isArray(deviceList)) return;
    deviceList.forEach(item => {
      const device = markerGroup[item.deviceId];
      device.current.leafletElement.setIcon(icon);
    });
  }, 10);
};
const drawTempClusterMarkers = markerList => {
  let leafletView = tempLeafletView;
  if (leafletView) {
    leafletView.remove();
  }
  leafletView = new PruneClusterForLeaflet();
  !_map.hasLayer(leafletView) && _map.addLayer(leafletView);
  markerList.map(item => {
    var marker = new PruneCluster.Marker(...item.position, {
      icon: getIcon(item, []),
      attribution: item,
    });
    leafletView.RegisterMarker(marker);
  });

  leafletView.PrepareLeafletMarker = function(leafletMarker, data) {
    leafletMarker.options.title = data.attribution.data.deviceName;
    leafletMarker
      .setIcon(data.icon)
      .on('click', e => markerClickHandler({ data: { ...data, ...e }, leafletMarker }));
  };
  leafletView.__BuildLeafletCluster = leafletView.BuildLeafletCluster;
  leafletView.BuildLeafletCluster = function(cluster, data) {
    const clusterMarker = leafletView.__BuildLeafletCluster(cluster, data);
    setClusterMarkerTitle(clusterMarker);
    return clusterMarker;
  };
  leafletView.BuildLeafletClusterIcon = function(cluster) {
    const count = cluster.population;
    const { szType, deviceType } = cluster.lastMarker.data.attribution.data;
    const className =
      szType === 1
        ? videoClusterClassName
        : deviceType + '' === '1' || deviceType + '' === ''
        ? faceClusterClassName
        : carClusterClassName;
    return L.divIcon({
      html: `<span>${
        count > 9999 ? '<span style="padding-left:0.01rem;">9999+</span>' : count
      }</span>`,
      className,
      iconSize: L.point(65, 25, true),
    });
  };
  leafletView.ProcessView();
  tempLeafletView = leafletView;
};
/**
 * 根据图形，绘制图形范围内的设备点位
 * @param type 图形类型
 * @param datalist 数据
 * @param needCluster 是否需要聚散
 */
export const drawTempMarkersWithGraphic = (type, datalist, needCluster) => {
  let rst = [];
  if (type === 'circle') {
    const { lnglat, radius } = datalist;
    rst = circleSelectInFront(lnglat, radius);
  } else if (type === 'polygon') {
    rst = polygonSelectInFront(datalist);
  } else {
  }
  drawTempMarkers(rst, needCluster);
};
/**
 * 绘制临时点位
 * @param {Array} datalist 数据
 * @param {Boolean} needCluster 是否需要聚散
 */
export const drawTempMarkers = (datalist, needCluster = false) => {
  tempMarkers.forEach(mk => _map.removeLayer(mk));
  tempMarkers = [];

  let visible = true,
    opacity = 1;
  if (Array.isArray(datalist) && datalist.length > 0) {
    if (!needCluster) {
      datalist.forEach(item => {
        const { position, data } = item;
        const mk = L.marker(position, { icon: getIcon(item, []), data }).addTo(_map);
        const _data = { attribution: item, mapSelectData: [] };
        mk.on('click', e => markerClickHandler({ data: _data, leafletMarker: mk }));
        tempMarkers.push(mk);
      });
    } else {
      drawTempClusterMarkers(datalist);
    }
    visible = false;
    opacity = 0;
  }
  parent && parent.setState({ videoLayerChecked: visible });
  parent && parent.setState({ faceLayerChecked: visible });
  parent && parent.setState({ carLayerChecked: visible });
  setOpacity(0, opacity, true);
  setOpacity(1, opacity, true);
  setOpacity(2, opacity, true);
};
/**
 * 圈选
 * @param lnglat 圆心
 * @param radius 半径 单位米
 * @returns {[]} 圈选结果
 */
export const circleSelectInFront = (lnglat, radius) => {
  const rst = [];
  const from = L.latLng(lnglat);
  const options = { units: 'degrees' };
  parent &&
    parent.videoMarkers.forEach(item => {
      item.forEach(obj => {
        // const to = turf.point([obj.data.longitude, obj.data.latitude]);
        const to = L.latLng([obj.data.latitude, obj.data.longitude]);
        // const distance = turf.distance(from, to, options);
        let distance = from.distanceTo(to);
        distance = CircleSelect.meter2degree(distance);
        if (distance <= radius) {
          rst.push(obj);
        }
      });
    });
  return rst;
};
/**
 * 前端框选
 * @param coordinateList 多边形坐标，数组第一个元素与最后一个用同一个点
 */
export const polygonSelectInFront = coordinateList => {
  const poly = turf.polygon([coordinateList]);
  const rst = [];
  parent &&
    parent.videoMarkers.forEach(item => {
      item.forEach(obj => {
        let point = turf.point([obj.data.longitude, obj.data.latitude]);
        const tmp = pointsWithinPolygon(point, poly);
        if (tmp.features.length > 0) {
          rst.push(obj);
        }
      });
    });
  return rst;
};
