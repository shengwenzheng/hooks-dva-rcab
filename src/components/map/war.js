import React, { createRef, Component } from 'react';
import { Map, Marker, Popup, Polyline, Tooltip, LayersControl } from 'react-leaflet';
import styles from './index.less';
import './iconPulse/index.js';
import './iconPulse/pulse.css';
import './simplemarkers/Control.SimpleMarkers';
import './simplemarkers/Control.SimpleMarkers.css';
// import HLSSource from '../HLSSource/index';
import { connect } from 'dva';
import './editor/leaflet-editable-polyline';
import RectangleSelect from './select/rectangle';
import PolygonSelect from './select/polygon';
import CircleSelect from './select/circle';
// eslint-disable-next-line no-unused-vars
import { pgis, amap } from './config/index';
import './bouncemarker/bouncemarker';
import {
  videoIcon,
  videoSelectedIcon,
  dragIcon,
  markerGroup,
  state,
  createClusterCustomIcon,
  noLatlngMessage,
  addMarkerIcon,
  passwayIcon,
  policeBoxIcon,
  tollStationIcon,
  layerFlag,
} from './constant/index';
import { ListMarker } from './listmarker/index';
import Alarm from './alarm/index';
import { AllDTracking, drawDoubtPoint } from '@/components/map/alldtracking';
import { message } from 'antd';
import 'prunecluster/dist/LeafletStyleSheet.css';
import {
  createMarkers,
  markerClickHandler,
  setOpacity,
  clearFlascluster,
  polygonSelectInFront,
  circleSelectInFront,
} from './listmarker/fastcluster';
import AreaJson from '@/assets/geojson/hangzhou.json';
import './listmarker/oms.min.js';
import { Checkbox } from 'antd';
import DrawPanel from '@/components/map/drawPanel';
import PreventCircle from './prevent/index';
import CheckPoint from '@/components/map/checkpoint';
import Subway from '@/components/map/subway';
import Police from '@/components/map/police';
import PoliceAlarm from '@/components/map/policeAlarm';
import Panel from '@/components/map/panel';

const { L } = window;
const {
  crs,
  minZoom,
  maxZoom,
  initZoom,
  mapUrl,
  wgs84togcj02,
  gcj02towgs84,
  TileLayer,
  zOffset,
} = process.env.isPgis ? pgis : amap;

class SKMap extends Component {
  constructor(props) {
    super(props);
    this.state = state;
    this.mapRef = createRef();
    this.refmarker = createRef();
    this.videoPlayerRef = createRef();
    this.radiusRef = createRef();
    this.listMarkerRef = createRef();
  }
  componentDidMount() {
    this.__deviceData = null;
    this.initState();
    this.props.dispatch({
      type: 'map/mapAction',
      payload: {
        CircleSelectFn: this.CircleSelect,
        PolygonSelectFn: this.PolygonSelect,
        RectangleSelectFn: this.RectangleSelect,
        clearSelectEventFn: this.clearSelectEvent,
        showAlarmPointFn: this.showAlarmPoint,
        setCenterFn: this.setCenter,
        drawHullFn: (data, isFlash = false) => this.alarmRef.drawHull(data, this.map, isFlash),
        drawRouteMarkerFn: this.drawRouteMarker,
        isValidLatLngFn: this.isValidLatLng,
        openVideoPopupFn: this.openVideoPopup,
        fitBounds: b => this.map.fitBounds(b),
        zoomIn: () => {
          this.map.zoomIn();
        },
        zoomOut: () => {
          this.map.zoomOut();
        },
        addVideoDeviceLayer: this.addVideoDeviceLayer,
        getMap: () => this.map,
      },
    });
    this.props.dispatch({
      type: 'map/getDeviceCameraList',
    });
    // ----------------------leaflet地图对象-------------this赋值标记------------------
    this.map = this.mapRef.current.contextValue.map;
    this.videoMarkers = [[], [], []]; // 视频 人脸 车辆
    this.deviceOpacity = 1; // 设备图标透明度
    this.lastSetcenterArgs = null; // 上一次参数记录

    // 框选、圈选和多边形选择初始化
    RectangleSelect.init(this);
    // PolygonSelect.init(this);
    // CircleSelect.init(this);

    clearFlascluster();
    this.map.on('click', this.recoverLayerState);
  }
  componentWillUnmount() {
    this.__deviceData = [];
    this.props.dispatch({
      type: 'common/setreaddevicelist',
      payload: {
        deviceType: '',
      },
    });
    this.initState();
    this.map && this.map.closePopup();
  }
  /**
   * 初始化state状态
   */
  initState() {
    this.setState({ arrowPoints: [] });
    this.setState({ pathPoints: [] });
    this.setState({ trackData: [] });
    this.setState({ trackPlayer: [] });
    this.setState({ childTrackList: [] });
    this.setState({ childTrackPlayer: [] });
  }
  /**
   * 设置地图中心位置
   * @param lat 纬度
   * @param lng 经度
   * @param zoom 层级
   */
  setCenter = (lat, lng, zoom) => {
    if (isFinite(lat) && isFinite(lng)) {
      const rst = wgs84togcj02(Number(lng), Number(lat));
      // eslint-disable-next-line new-cap
      zoom
        ? this.mapRef.current.contextValue.map.setView(new L.latLng(...rst), zoom, {
            animation: true,
          })
        : // eslint-disable-next-line new-cap
          this.mapRef.current.contextValue.map.panTo(new L.latLng(...rst));
    } else {
      this.setCenter(30.28079, 120.19172, 13);
    }
  };
  /**
   * 执行框选
   * @param clearLast 清除旧图形
   */
  RectangleSelect = ({ isClear, callback }) => {
    if (isClear) {
      this.clearSelectEvent();
    }
    RectangleSelect.clickCount = 0;
    RectangleSelect.startPoint = null;
    RectangleSelect.endPoint = null;
    RectangleSelect.callback = callback;
    this.mapRef.current.contextValue.map.on('mousedown', RectangleSelect.mousedown);
  };
  /**
   * 多边形选择
   * @param isClear 是否清除上一次图形
   * @param isFromHK 是否只查询海康人脸卡口
   * @param isSelectAll 是否走前端查询
   * @param searchType 搜索类别，人体 "person"，机动车 "vehicle"，人脸 "face"，非机动车 "bicycle"
   * @constructor
   */
  PolygonSelect = (isClear, isFromHK = false, isSelectAll = false, searchType) => {
    if (isClear) {
      this.clearSelectEvent();
    }
    const polygonSelect = new PolygonSelect();
    polygonSelect.bShowTooltip = true;
    polygonSelect.init(this);
    polygonSelect.start();
    // ----------------------记录查询海康人脸卡口/结构化和非结构化设备标识/搜索类别---this赋值标记---
    this.isFromHK = isFromHK;
    this.isSelectAll = isSelectAll;
    this.searchType = searchType;
  };
  /**
   * 圈选
   * @param isClear 是否清除上一次图形
   * @param isFixRadius 是否带初始半径
   * @param isShowRader 是否显示雷达
   * @param isFromHK 是否只查询海康人脸卡口
   * @param isSelectAll 是否走前端查询
   * @param searchType 搜索类别，人体，机动车，人脸，非机动车
   * @constructor
   */
  CircleSelect = ({
    isClear,
    isFixRadius = false,
    isShowRader = false,
    isFromHK = false,
    isSelectAll = false,
    searchType,
    callback,
  }) => {
    // this.doNotifyClearSelect();
    setTimeout(() => {
      if (isClear) {
        this.clearSelectEvent();
      }

      const circleSelect = new CircleSelect();
      circleSelect.init(this);
      circleSelect.clickCount = 0;
      circleSelect.startPoint = null;
      circleSelect.endPoint = null;
      circleSelect.isFixRadius = isFixRadius;
      circleSelect.isShowRader = isShowRader;
      circleSelect.callback = callback;

      this.setState({ draggedCircle: [-30, -120] });

      this.mapRef.current.contextValue.map.on(
        'mousedown',
        circleSelect.mousedown.bind(circleSelect),
      );
    }, 0);
    // ----------------------记录查询海康人脸卡口/结构化和非结构化设备标识/搜索类别---this赋值标记---
    this.isFromHK = isFromHK;
    this.isSelectAll = isSelectAll;
    this.searchType = searchType;
  };
  // 圈选地图操作
  doCircleSelect = (lng, lat, radius) => {
    // const { mapFn } = this.props;
    const { isFixRadius } = {};
    const isFromHK = this.isFromHK;
    const isSelectAll = this.isSelectAll;
    const searchType = this.searchType;
    const lnglat = gcj02towgs84(lng, lat);
    if (isSelectAll) {
      const { total, used } = this.props.getNumber[0] || {};
      let ableUsedPower = -1;
      if (total && used) {
        ableUsedPower = total - used;
      }
      let mapDeviceList = circleSelectInFront(lnglat, radius); // 圈选结果
      mapDeviceList = mapDeviceList.map(item => item.data);
      if (ableUsedPower > -1 && mapDeviceList.length > ableUsedPower) {
        message('可剩算力不足, 请重新圈选！');
        this.clearSelectEvent();
        this.CircleSelect(true, false, false, false, true);
      } else {
        this.props.dispatch({
          type: 'comPower/setMapDeviceList',
          payload: { mapDeviceList },
        });
      }
    } else
      setTimeout(() => {
        const data = {
          pointBean: {
            longitude: lnglat[1],
            latitude: lnglat[0],
          },
          radius,
        };
        1 > 2 &&
          this.props
            .dispatch({
              type: 'common/mapSelectData',
              payload: { data, isFromHK, isSelectAll, searchType },
            })
            .then(res => {
              this.setState({ mapSelectData: res });
              let obj = {};
              if (isFixRadius) {
                obj = {
                  iconNumPolygo: 0,
                  iconNumCircle: 0,
                  iconNumMap: 1,
                };
              } else {
                obj = {
                  iconNumPolygo: 0,
                  iconNumCircle: 1,
                  iconNumMap: 0,
                };
              }
              this.mapFn(
                res,
                {
                  ...obj,
                },
                JSON.stringify(data),
              );
            });
        this.setState({ bDoSelect: true });
      }, 0);
  };
  // 多边形操作
  doPolygonSelect = points => {
    const { dispatch } = this.props;
    const isFromHK = this.isFromHK;
    const isSelectAll = this.isSelectAll;
    const searchType = this.searchType;
    const data = [];
    const dataTwo = [];
    points.forEach(item => {
      const lnglat = gcj02towgs84(item[1], item[0]);
      data.push({
        longitude: lnglat[1],
        latitude: lnglat[0],
      });
      dataTwo.push([lnglat[1], lnglat[0]]);
    });

    if (isSelectAll) {
      const { total, used } = this.props.getNumber[0] || {};
      let ableUsedPower = -1;
      if (total && used) {
        ableUsedPower = total - used;
      }
      dataTwo[dataTwo.length - 1] = dataTwo[0];
      let mapDeviceList = polygonSelectInFront(dataTwo); // 多边形选择结果
      mapDeviceList = mapDeviceList.map(item => item.data);
      if (ableUsedPower > -1 && mapDeviceList.length > ableUsedPower) {
        message('可剩算力不足, 请重新画多边形选择！');
        this.clearSelectEvent();
        this.PolygonSelect(true, false, true);
      } else {
        this.props.dispatch({
          type: 'comPower/setMapDeviceList',
          payload: { mapDeviceList },
        });
      }
    } else {
      data.length > 0 && data.push(data[0]);
      setTimeout(() => {
        if (1 > 2) {
          dispatch({
            type: 'common/mapSelectData',
            payload: { data, isFromHK, isSelectAll, searchType },
          }).then(res => {
            this.setState({ mapSelectData: res });
            this.mapFn(
              res,
              {
                iconNumPolygo: 1,
                iconNumCircle: 0,
                iconNumMap: 0,
              },
              JSON.stringify(data),
            );
          });
        }
        this.setState({ bDoSelect: true });
      }, 300);
    }
  };
  // 清空数据
  doNotifyClearSelect = () => {
    // const { mapFn } = this.props;
    this.mapFn(
      [],
      {
        iconNumPolygo: 0,
        iconNumCircle: 0,
        iconNumMap: 0,
      },
      '',
    );

    this.setState({ mapSelectData: [] });
  };
  // 地图回调
  mapFn = (res = [], obj, strShape) => {
    this.props.dispatch({
      type: 'common/mapData',
      payload: {
        mapData: {
          data: res,
          shape: strShape,
          ...obj,
        },
      },
    });
  };
  /**
   * 清除选择注册的事件
   */
  clearSelectEvent = () => {
    // CircleSelect.clear();
    RectangleSelect.clear();
    // PolygonSelect.clear();
  };
  /**
   * 圆上面的拖动图标拖动事件
   * @param e
   */
  updatePosition = e => {
    const lnglat = e.target.getLatLng();
    CircleSelect.endPoint = lnglat;
    CircleSelect.close();
    CircleSelect.addCircle();
  };
  /**
   * 圆拖拽图标拖动结束事件
   * @param e
   */
  updatePositionAndSelect = e => {
    this.doNotifyClearSelect(true);
    this.updatePosition(e);
    CircleSelect.select();
    CircleSelect.createRadarAnimate();
  };
  /**
   * 更新圆的信息
   * @param lnglat 拖动图标的新坐标
   */
  setDraggableCircle = lnglat => {
    const radius = CircleSelect.radiusM;
    this.radiusRef.current.leafletElement.setContent(`半径：${radius}米`);
    this.refmarker.current.leafletElement.setLatLng([lnglat.lat, lnglat.lng]);
  };
  /**
   * 打开冒泡视频播放窗口
   */
  openVideoPopup = (arg, playback = false) => {
    if (!arg) return;
    if (!this.markerGroup) return;
    this.map.closePopup();
    const data = arg;
    const lat = Number(data.latitude) + 0.00065;
    const timestamp = arg.timestamp || (arg._source ? arg._source.timestamp : null);
    // this.setCenter(lat, data.longitude, 18);
    setTimeout(() => {
      const ref = this.markerGroup[data.deviceId];
      if (ref && ref.fireEvent && this.map.hasLayer(ref)) {
        ref.fireEvent('click', { isplayback: playback, timestamp });
      } else if (ref && !ref.fireEvent) {
        markerClickHandler({ data: { isplayback: playback, timestamp, ...ref.data } });
      } else {
        const obj = arg._source || arg;
        let { latitude, longitude } = obj;
        latitude = Number(latitude);
        longitude = Number(longitude);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          const position = [Number(latitude), Number(longitude)];
          const attribution = {
            data: { szType: 1, ...obj, latitude, longitude },
            position,
            latitude,
            longitude,
          };
          markerClickHandler({
            data: { isplayback: playback, timestamp, attribution, mapSelectData: [] },
          });
        }
      }
    }, 50);
  };
  /**
   * setState 函数封装
   * @param msg
   */
  transferMsg(msg) {
    this.setState({
      ...msg,
    });
  }
  /**
   * 设备点位数据加工
   * @param deviceData 原始数据
   * @param videoJsOptions 视频播放参数
   */
  createVideoMarkersData = (deviceData, videoJsOptions) => {
    const videoMarkers = []; // [{lnglat:[30.2,120.2],playUrl:'rtmp://33.95.245.98:1965/330106530001065960/livestream'}];
    if (Array.isArray(deviceData)) {
      if (deviceData.length > -1000 && deviceData.length < 200) {
        // 测试数据
        let i = 0;
        while (i++ < 50000 - 1) {
          let obj = {};
          obj = Object.assign({}, deviceData[0]);
          obj.longitude = 120 + Math.random() / 1;
          obj.latitude = 30 + Math.random() / 1;
          obj.deviceId = i;
          obj.deviceName = '设备序号' + i;
          obj.szType = 1;
          obj.deviceType = Math.floor(1000 * Math.random()) % 2;
          deviceData.push(obj);
        }
      }
      // eslint-disable-next-line no-unused-vars
      deviceData.forEach((item, index) => {
        if (!item.longitude && item.deviceBean) {
          item.longitude = item.longitude || item.deviceBean.longitude;
          item.latitude = item.latitude || item.deviceBean.latitude;
        }
        if (isFinite(item.longitude) && isFinite(item.latitude)) {
          markerGroup[item.deviceId] = markerGroup[item.deviceId] || createRef();
          const lon = Number(item.longitude);
          const lat = Number(item.latitude);
          const lonlat = wgs84togcj02(lon, lat);
          item.szType = process.env.isPgis
            ? item.szType || item.ptzType
            : item.szType || item.ptzType + 1;
          if (lon && lat) {
            videoMarkers.push({
              position: lonlat,
              id: item.deviceId,
              data: item,
              markerRef: markerGroup[item.deviceId],
              videoJsOptions,
            });
          }
          this.markerGroup = markerGroup;
        }
      });
    }
    return videoMarkers;
  };
  /**
   *布控告警数据
   */
  addAlarmData = alarmData => {
    if (Array.isArray(alarmData)) {
      alarmData = alarmData.filter(
        item =>
          item.latitude &&
          item.longitude &&
          item.latitude !== 0 &&
          item.latitude !== '0' &&
          item.longitude !== 0 &&
          item.longitude !== 0,
      );
      this.setState({ alarmData });
      const bounds = [];
      alarmData
        .slice(0, 10)
        .map(item => bounds.push([Number(item.latitude), Number(item.longitude)]));
      // bounds.length > 0 && this.map.fitBounds(bounds);
    }
  };
  /**
   * 设置子组件引用
   */
  onAlarmRef = ref => {
    this.alarmRef = ref;
  };
  onAlltrackingRef = ref => {
    this.alltrackRef = ref;
  };
  /**
   * 布控报警点位定位
   */
  showAlarmPoint = point => {
    const lat = point.latitude;
    const lng = point.longitude;
    if (isFinite(lat) && isFinite(lng) && this.isValidLatLng({ lat, lng })) {
      this.alarmRef.showAlarmPoint(point, this.map);
      this.setCenter(lat, lng);
    } else {
      message.destroy();
      message.info(noLatlngMessage, 3);
    }
  };
  /**
   * 判定经纬度是否在杭州附近
   */
  isValidLatLng({ lat, lng }) {
    return lat > 29 && lat < 31 && lng > 118 && lng < 121;
  }
  /**
   * 添加设备marker(大数据量)
   * @param videoMarkers 点位数据
   * @param mapSelectData 圈选/框选选中的点位
   * @pararm deviceType 视频 0， 人脸 1， 车辆 2
   */
  createClusterMarkers(videoMarkers, mapSelectData, deviceType) {
    if (!this.videoMarkers) return;
    const _mks = this.videoMarkers[deviceType];
    if (Array.isArray(videoMarkers) && _mks && videoMarkers.length !== _mks.length) {
      createMarkers(
        videoMarkers,
        this.map,
        mapSelectData,
        this.markerGroup,
        this.videoPlayerRef,
        this.props.dispatch,
        this.setCenter,
        deviceType,
        this,
      );
      this.videoMarkers[deviceType] = videoMarkers;
    }
  }
  /**
   * 监控设备点位地图撒点
   * @param videoMarkers 原始数据
   * @param mapSelectData 被选中的数据
   */
  addClusterMarkerToMap(videoMarkers, mapSelectData) {
    this.createClusterMarkers(
      videoMarkers.filter(item => item.data.szType === 1),
      mapSelectData,
      0, // 视频
    );
    this.createClusterMarkers(
      videoMarkers.filter(
        item =>
          item.data.szType === 2 &&
          (item.data.deviceType + '' === '1' || item.data.deviceType + '' === ''),
      ),
      mapSelectData,
      1, // 人脸
    );
    this.createClusterMarkers(
      videoMarkers.filter(
        item =>
          item.data.szType === 2 &&
          item.data.deviceType + '' !== '1' &&
          item.data.deviceType + '' !== '',
      ),
      mapSelectData,
      2, // 车辆
    );
  }
  /**
   * 添加监控设备
   */
  addVideoDeviceLayer = () => {
    const { videoJsOptions, mapSelectData } = this.state;
    const { deviceCameraList = [] } = this.props;
    const videoMarkers = this.createVideoMarkersData(
      this.__deviceData || deviceCameraList,
      videoJsOptions,
    );
    if (mapSelectData && mapSelectData.length > 0) {
      // this.setDeviceListIcon(mapSelectData, videoSelectedIcon);
      // ----------------------记录后台返回的地图选择结果-------------this赋值标记------------------
      this.mapSelectData = mapSelectData;
    }
    this.addClusterMarkerToMap(videoMarkers, mapSelectData);
  };
  /**
   * 关闭防控圈、环绕圈和地铁站详情框
   */
  recoverLayerState = () => {
    const {
      dispatch,
      recoverState,
      recoverCheckState,
      recoverAlarmPoliceState,
      recoverPoliceState,
      recoverSubwayState,
    } = this.props;
    dispatch({
      type: 'fight/modal135ChangeFn',
      payload: {
        show: false,
      },
    });
    recoverState();
    recoverCheckState();
    recoverAlarmPoliceState();
    recoverPoliceState();
    recoverSubwayState();
  };
  render() {
    window.gmap = this;
    const { layerChecked } = this.props;
    return (
      <Map
        className={styles.mapContainer}
        center={this.state.latlng}
        onClick={this.handleClick}
        onDblClick={this.mapdblclick}
        ref={this.mapRef}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoom={initZoom}
        crs={crs}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url={mapUrl} zOffset={zOffset} />
        <LayersControl position="topright" collapsed={false}>
          <LayersControl.Overlay checked={layerChecked.checkPoint} name="环城圈">
            <CheckPoint />
          </LayersControl.Overlay>
          <LayersControl.Overlay checked={layerChecked.preventCircle} name="135快反圈">
            <PreventCircle />
          </LayersControl.Overlay>
          <LayersControl.Overlay checked={layerChecked.subway} name="地铁站">
            <Subway />
          </LayersControl.Overlay>
          <LayersControl.Overlay checked={layerChecked.police} name="警力">
            <Police />
          </LayersControl.Overlay>
          <LayersControl.Overlay checked={layerChecked.policeAlarm} name="警情">
            <PoliceAlarm />
          </LayersControl.Overlay>
        </LayersControl>
        <Panel />
      </Map>
    );
  }
}

export default connect(({ map }) => {
  return {
    savePoi: map.savePoi,
    deviceCameraList: map.deviceCameraList,
    locationCheckPoint: map.locationCheckPoint,
    layerChecked: map.layerChecked,
    recoverState: map.recoverState,
    recoverCheckState: map.recoverCheckState,
    recoverAlarmPoliceState: map.recoverAlarmPoliceState,
    recoverPoliceState: map.recoverPoliceState,
    recoverSubwayState: map.recoverSubwayState,
  };
})(SKMap);
