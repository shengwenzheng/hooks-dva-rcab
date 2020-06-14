const { L } = window;

// 存放播放器对象,id用deviceId
export const videoPlayerMap = new Map();
export const poiMap = new Map();
export const preventCircleMap = new Map();
export const circleSelectMap = new Map();
export const polygonSelectMap = new Map();
// 摄像头图标参数
export const videoIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera.png'),
  iconAnchor: [16, 16],
  popupAnchor: [10, -44],
  iconSize: [32, 32],
});
export const videoSelectedIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-selected.png'),
  iconAnchor: [16, 16],
  popupAnchor: [10, -44],
  iconSize: [32, 32],
});
export const videoClickedIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-orange.png'),
  iconAnchor: [16, 16],
  popupAnchor: [10, -44],
  iconSize: [32, 32],
});
export const smallVideoIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-small.png'),
  iconAnchor: [10, 10],
  popupAnchor: [10, -44],
  iconSize: [20, 20],
});
export const videoPointIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-point-online.png'),
  iconAnchor: [10, 10],
  iconSize: [20, 20],
  popupAnchor: [10, -44],
});
export const faceIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-face.png'),
  iconAnchor: [16, 16],
  popupAnchor: [10, -44],
  iconSize: [32, 32],
});
export const faceClickedIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-face-selected.png'),
  iconAnchor: [16, 16],
  popupAnchor: [10, -44],
  iconSize: [32, 32],
});
export const itcIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-itc.png'),
  iconAnchor: [16, 16],
  popupAnchor: [10, -44],
  iconSize: [32, 32],
});
export const carIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-car.png'),
  iconAnchor: [16, 16],
  popupAnchor: [10, -44],
  iconSize: [32, 32],
});
export const carClickedIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/camera-car-selected.png'),
  iconAnchor: [16, 16],
  popupAnchor: [10, -44],
  iconSize: [32, 32],
});
// 轨迹箭头图标参数
export const arrowIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/arrow_top.png'),
  iconAnchor: [11, 0],
  iconSize: [18, 18],
});
// 圈选拖动图标参数
export const dragIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/dragMarker.png'),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});
export const trackPointIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/track-selected.png'),
  iconSize: [72, 72],
  iconAnchor: [36, 36],
  popupAnchor: [0, -10],
});
// 报警图标
export const alarmIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/alarm.gif'),
  iconSize: [90, 96],
  iconAnchor: [45, 100],
  popupAnchor: [0, -10],
});
// 报警图标-人脸
export const alarmMenIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/alarm-men.gif'),
  shadowUrl: require('../../../assets/images/map/alarm-marker.png'),
  iconSize: [90, 96],
  shadowSize: [20, 20],
  iconAnchor: [45, 100],
  shadowAnchor: [10, 10],
  popupAnchor: [0, -10],
});
// 报警图标-车辆
export const alarmCarIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/alarm-car.gif'),
  shadowUrl: require('../../../assets/images/map/alarm-marker.png'),
  iconSize: [90, 96],
  shadowSize: [20, 20],
  iconAnchor: [45, 100],
  shadowAnchor: [10, 10],
  popupAnchor: [0, -10],
});
// 报警定位图标
export const alarmLocationIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/alarm-selected.png'),
  shadowUrl: require('../../../assets/images/map/alarm-location-circle.png'),
  iconSize: [60, 60],
  shadowSize: [62, 62],
  iconAnchor: [30, 30],
  shadowAnchor: [31, 31],
  popupAnchor: [0, -10],
});
export const circleCneterIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/alarm-location.png'),
  iconSize: [39, 42],
  iconAnchor: [19, 21],
  popupAnchor: [0, -10],
});
// 疑似点位图标
export const doubtIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/doubtPoint.png'),
  iconSize: [72, 72],
  iconAnchor: [36, 36],
  popupAnchor: [0, -10],
});
export const addMarkerIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/add_marker.png'),
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, 12],
});
export const addMarkerDivIcon = new L.DivIcon({
  html: `<div>
           <span><img src=${require('../../../assets/images/map/add_marker.png')}></span>
           <span><img src=${require('../../../assets/images/map/doubtPoint.png')} onclick="gmap.delateConfigMarker()"></span>
        </div>`,
  className: 'addMarkerDivIconClass',
});
export const passwayIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/passway.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const policeBoxIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/policeBox.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const tollStationIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/tollStation.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const disablePasswayIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/passway-disable.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const disablePoliceBoxIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/policeBox-disable.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const disableTollStationIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/tollStation-disable.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const passwaySelectedIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/passwaySelected.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const policeSelectedBoxIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/policeBoxSelected.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const tollStationSelectedIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/tollStationSelected.png'),
  iconSize: [32, 32],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});
export const oneMinuteIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/one-minute.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const threeMinuteIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/three-minute.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const fiveMinuteIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/five-minute.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const oneMinuteHighLightIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/oneK.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const threeMinuteHighLightIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/threeK.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const fiveMinuteHighLightIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/fiveK.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const oneMinuteDisableIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/one-minute-disable.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const threeMinuteDisableIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/three-minute-disable.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const fiveMinuteDisableIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/five-minute-disable.png'),
  iconSize: [40, 42],
  iconAnchor: [20, 32],
  popupAnchor: [0, -32],
});
export const stationPointIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/stationPoint.png'),
  iconSize: [11, 10],
  iconAnchor: [5, 5],
  popupAnchor: [0, -10],
});
export const policeIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/police.png'),
  iconSize: [37, 39],
  iconAnchor: [18, 39],
  popupAnchor: [0, -39],
});
export const policeSelectedIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/police-selected.png'),
  iconSize: [37, 39],
  iconAnchor: [18, 39],
  popupAnchor: [0, -39],
});
export const alarm110Icon = new L.Icon({
  iconUrl: require('../../../assets/images/map/110Alarm.png'),
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -34],
});
export const alarmControlIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/controlAlarm.png'),
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -34],
});
export const alarm110DHighLightIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/110Alarm-highlight.png'),
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -34],
});
export const alarmControlHighLightIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/controlAlarm-highlight.png'),
  iconSize: [34, 44],
  iconAnchor: [17, 44],
  popupAnchor: [0, -34],
});
export const deleterMarkerIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/delete.png'),
  iconSize: [16, 16],
  iconAnchor: [-13, 10],
  popupAnchor: [0, -44],
});
export const subwayIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/subway.png'),
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -18],
});
export const subwaySelectedIcon = new L.Icon({
  iconUrl: require('../../../assets/images/map/subway-selected.png'),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -24],
});

// 轨迹多段线参数
export const polylineStyles = {
  weight: 4,
  color: '#008AFF', // 颜色
  fillColor: '#008AFF',
  fillOpacity: 0, // 填充透明度
  // dashArray: '6', // 设置虚线
};
// 结伴同行图标
export const getSameGoIcon = index =>
  new L.Icon({
    iconUrl: require(`../../../assets/images/map/samego/${index}.png`),
    iconAnchor: [16, 16],
    popupAnchor: [0, -5],
    iconSize: [32, 32],
  });
// 结伴同行轨迹样式
export const getSameGoPolylineStyles = index => {
  return {
    weight: 4,
    color: [
      '#648cdf',
      '#745cce',
      '#f7b500',
      '#d5793a',
      '#d24400',
      '#24cab2',
      '#00a87e',
      '#509700',
      '#000000',
    ][index], // 颜色
    fillColor: '#008AFF',
    // fillOpacity: 0, // 填充透明度
    // dashArray: '6', // 设置虚线
  };
};
/**
 * 聚散图标设置函数
 * @param cluster
 */
export const createClusterCustomIcon = function(cluster) {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<span>${count > 999 ? '<span>999</span><div>+</div>' : count}</span>`,
    className: count > 999 ? 'marker-cluster-custom-12' : 'marker-cluster-custom',
    iconSize: L.point(32, 32, true),
  });
};
export const saveDivIcon = new L.divIcon({
  html: `保存`,
  className: 'preventCircle-save',
  iconSize: L.point(42, 23, true),
});
export const editDivIcon = new L.divIcon({
  html: `编辑`,
  className: 'checkPoint-save',
  iconSize: L.point(42, 23, true),
});
export const editCheckPointDivIcon = new L.divIcon({
  html: `编辑`,
  className: 'checkPoint-save',
  iconSize: L.point(42, 23, true),
});
// 存放摄像头marker点， { deviceId: marker }
export const markerGroup = [];
// 状态常量
export const state = {
  // 地图初始中心点坐标
  latlng: {
    lat: 30.25027961206251,
    lng: 120.16514401757941,
  },
  // 视频播放参数
  videoJsOptions: {
    autoplay: true,
    controls: true,
    sources: [
      {
        src: '', // rtmp://33.95.245.98:1955/330119520001001003/livestream',
        type: 'rtmp/flv',
        language: 'zh-CN',
      },
    ],
    notSupportedMessage: '视频加载中...', // '此视频暂无法播放，请稍后再试',
    techOrder: ['html5', 'flvjs'], // 如果是rtmap流，这行要注释掉
    flvjs: {
      mediaDataSource: {
        isLive: true,
        cors: true,
        withCredentials: false,
        hasAudio: false, // 只有视频，没有音频设置false
      },
    },
  },
  // 存放所有轨迹原始数据
  trackData: [],
  // 绘制轨迹的节点
  pathPoints: [], // [[30.1294, 120.0820], [30.2294, 120.01820], [30.28974, 120.200020], [30.1294, 120.20820], [30.18594, 120.14200820]],
  // 轨迹方向的marker
  arrowPoints: [],
  // 拖动圆的辅助点
  draggedCircle: [-30.2, -120.2],
  // 选择动作是否已发出
  bDoSelect: false,
  // 是否开始轨迹回放
  canPlay: false,
  // 轨迹回放
  trackPlayer: [], // { LOAD: 33, SPEED: 2, status: 1, t: "180927072508000", course: 0, lat: 30.22376666666667, lng: 120.745841666666664 },
  // 地图圈选等选择结果
  mapSelectData: [],
  // 布控报警数据
  alarmData: [],
  // 设备点位透明度
  markerOpacity: 1,
  // 视频点位图层可见
  videoLayerChecked: true,
  // 人脸点位图层可见
  faceLayerChecked: true,
  // 车辆点位图层可见
  carLayerChecked: true,
};

export const noLatlngMessage = '该点位经纬度不存在，地图绘制失败！';
export const layerFlag = require('@/assets/images/map/layerFlag.png');
export const layerSelectedFlag = require('@/assets/images/map/layerSelectedFlag.png');
export const circleSelectImg = require('@/assets/images/map/circleSelect.png');
export const circleSelectedImg = require('@/assets/images/map/circleSelected.png');
export const rectangleSelectImg = require('@/assets/images/map/rectangleSelect.png');
export const rectangleSelectedImg = require('@/assets/images/map/rectangleSelected.png');
export const deleteMarkeImg = require('@/assets/images/map/del_marker.png');
