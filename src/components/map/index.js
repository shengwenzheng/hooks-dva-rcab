import React, { createRef, Component } from 'react';
import { Map, Marker, Popup, Polyline, Tooltip, LayersControl, LayerGroup } from 'react-leaflet';
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
  addMarkerDivIcon,
  passwayIcon,
  policeBoxIcon,
  tollStationIcon,
  disablePasswayIcon,
  disablePoliceBoxIcon,
  disableTollStationIcon,
  poiMap,
  oneMinuteIcon,
  threeMinuteIcon,
  fiveMinuteIcon,
  deleteMarkeImg,
  oneMinuteHighLightIcon,
  threeMinuteHighLightIcon,
  fiveMinuteHighLightIcon,
  preventCircleMap,
  circleSelectMap,
  polygonSelectMap,
  oneMinuteDisableIcon,
  threeMinuteDisableIcon,
  fiveMinuteDisableIcon,
} from './constant/index';
import { ListMarker } from './listmarker/index';
import Alarm from './alarm/index';
import { AllDTracking, drawDoubtPoint } from '@/components/map/alldtracking';
import { message, Modal } from 'antd';
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
import CheckPoint from '@/components/map/checkpoint';
import PreventCircle from '@/components/map/prevent';

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
const { confirm } = Modal;

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
    // 框选、圈选和多边形选择初始化
    RectangleSelect.init(this);
    // PolygonSelect.init(this);
    // CircleSelect.init(this);
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
        zoomIn: () => {
          this.map.zoomIn();
        },
        zoomOut: () => {
          this.map.zoomOut();
        },
        fitBounds: b => {
          this.map.fitBounds(b);
        },
        getCurrentSelectedPreventId: () => this.currentSelectedPreventId,
        setPreventCircleEditable: this.setPreventCircleEditable,
        clearSelectById: this.clearSelectById,
        savePrevent: this.savePrevent,
        setMarkerLatLngOfPreventCircle: this.setMarkerLatLngOfPreventCircle,
        getMapState: () => this.state,
        setMapStateOfBDoSelect: bDoSelect => (this.state.bDoSelect = bDoSelect),
      },
    });
    // this.props.dispatch({
    //   type: 'aside/clearSelectEvent',
    //   payload: {
    //     fn: this.clearSelectEvent,
    //   },
    // });
    this.props.dispatch({
      type: 'common/openVideoPopup',
      payload: {
        openVideoPopupFn: this.openVideoPopup,
      },
    });
    this.props.dispatch({
      type: 'control/alarmToMap',
      payload: {
        addAlarmDataFn: this.addAlarmData,
      },
    });
    // [1, 2, 3].map(item =>
    //   this.props.dispatch({
    //     type: 'map/savePoi',
    //     payload: {
    //       type: item,
    //       action: 'list',
    //     },
    //   }),
    // );
    // ----------------------leaflet地图对象-------------this赋值标记------------------
    this.map = this.mapRef.current.contextValue.map;
    this.videoMarkers = [[], [], []]; // 视频 人脸 车辆
    this.deviceOpacity = 1; // 设备图标透明度
    this.lastSetcenterArgs = null; // 上一次参数记录
    this.poiMap = poiMap;
    this.preventCircleMap = preventCircleMap;
    this.circleSelectMap = circleSelectMap;
    this.polygonSelectMap = polygonSelectMap;
    this.currentEditPreventId = null;
    this.currentSelectedPreventId = null;
    this.currentEditPreventType = null;
    this.bDrawCircleOrRectangle = false;
    this.mouseTips = null;
    this.markerTips = null;
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
   * 点跳跃参数
   */
  getBounceMarkerOptions = () => {
    return {
      bounceOnAdd: true,
      bounceOnAddOptions: { duration: 250, height: 50, loop: 1 },
      bounceOnAddCallback: e => {
        e && this.map.removeLayer(e);
        this.setState({ bDoSelect: false });
        setTimeout(() => {
          CircleSelect.clearAnimate();
          CircleSelect.fitBounds();
        }, 1000);
        const ref = this.markerGroup[e.options.data.deviceId];
        ref && ref.current && ref.current.leafletElement.setIcon(videoSelectedIcon);
      },
    };
  };

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
    } else if (Array.isArray(lat)) {
      const oridata = lat.filter(l => l);
      const rst = AreaJson.filter(item => {
        const name = item.properties.name;
        return oridata.findIndex(d => d.title && d.title.substr(0, 2) === name.substr(0, 2)) > -1;
      });
      if (rst.length > 0 && rst.length < 16) {
        let _lon = 120.19172,
          _lat = 30.28079;
        if (this.lastSetcenterArgs && rst.length > this.lastSetcenterArgs.length) {
          const addedItem = rst.find(
            item =>
              !this.lastSetcenterArgs.find(
                otherItem => item.properties.name === otherItem.properties.name,
              ),
          );
          if (addedItem) {
            this.lastSetcenterArgs.push(addedItem);
            const latlng = addedItem.properties.lonlat.split(',');
            _lon = Number(latlng[0]);
            _lat = Number(latlng[1]);
          }
        } else if (this.lastSetcenterArgs && rst.length < this.lastSetcenterArgs.length) {
          const reducedIndex = this.lastSetcenterArgs.findIndex(
            item => !rst.find(otherItem => item.properties.name === otherItem.properties.name),
          );

          if (reducedIndex > -1) {
            const reducedItem = this.lastSetcenterArgs.slice(reducedIndex, reducedIndex + 1)[0];
            let lastItem = this.lastSetcenterArgs[this.lastSetcenterArgs.length - 1];
            if (
              reducedItem.properties.name === lastItem.properties.name &&
              this.lastSetcenterArgs.length > 1
            ) {
              lastItem = this.lastSetcenterArgs[this.lastSetcenterArgs.length - 2];
            }
            const latlng = lastItem.properties.lonlat.split(',');
            _lon = Number(latlng[0]);
            _lat = Number(latlng[1]);
            this.lastSetcenterArgs.splice(reducedIndex, 1);
          }
        } else {
          if (rst.length === 1) {
            const latlng = rst[0].properties.lonlat.split(',');
            _lon = Number(latlng[0]);
            _lat = Number(latlng[1]);
          }
          this.lastSetcenterArgs = rst;
        }
        this.setCenter(_lat, _lon, 13);
      } else {
        this.setCenter(30.28079, 120.19172, 13);
        this.lastSetcenterArgs = rst;
      }
    }
  };

  /**
   * 布控地图人员按所在分局撒点，需要设置不同的地图中心点
   */
  setRealtimeControlCenter(videoMarkers) {
    let lastVideoMarkersLength = 0;
    if (Array.isArray(this.videoMarkers)) {
      this.videoMarkers.forEach(item => (lastVideoMarkersLength += item.length));
    }
    if (
      window.location.href.indexOf('realtimeControl') > -1 &&
      this.map &&
      videoMarkers.length !== lastVideoMarkersLength
    ) {
      const totalLatlng = [];
      videoMarkers.forEach(item => {
        const lat = item.position[0];
        const lng = item.position[1];
        if (this.isValidLatLng({ lat, lng })) {
          totalLatlng.push(item.position);
        }
      });
      if (totalLatlng.length > 0) {
        const bounds = L.polygon(totalLatlng).getBounds();
        this.mapRef.current.contextValue.map.fitBounds(bounds);
      }
    }
  }

  /**
   * 执行框选
   * @param clearLast 清除旧图形
   */
  RectangleSelect = isClear => {
    if (isClear) {
      this.clearSelectEvent();
    }
    RectangleSelect.clickCount = 0;
    RectangleSelect.startPoint = null;
    RectangleSelect.endPoint = null;
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
  PolygonSelect = ({
    isClear = true,
    isFromHK = false,
    isSelectAll = false,
    searchType = {},
    coordinates = null,
  } = {}) => {
    if (this.getDrawAuthority()) {
      message.warn('单个防控圈最多绘制三个区域，不能继续绘制！');
      return;
    }
    this.showPreventCircleSaveBtn();
    if (isClear) {
      this.clearSelectEvent();
    }
    const polygonSelect = new PolygonSelect();
    polygonSelect.bShowTooltip = true;
    polygonSelect.init(this);
    if (coordinates) {
      polygonSelect.points = coordinates;
      polygonSelect.onDoubleClick(false);
      polygonSelect.select();
      polygonSelect.triggerDragEvent();
      polygonSelect.bringbackToFront();
    } else {
      this.bDrawCircleOrRectangle = true;
      polygonSelect.start();
    }
    if (this.currentEditPreventId) {
      const key = `${this.currentEditPreventId}_${new Date().getTime()}`;
      this.polygonSelectMap.set(key, polygonSelect);
    }
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
    isClear = true,
    isFixRadius = false,
    isShowRader = false,
    isFromHK = false,
    isSelectAll = false,
    searchType,
    radius,
    startPoint,
  } = {}) => {
    if (this.getDrawAuthority()) {
      message.warn('单个防控圈最多绘制三个区域，不能继续绘制！');
      return;
    }
    // this.doNotifyClearSelect();
    setTimeout(() => {
      if (isClear) {
        this.clearSelectEvent();
      }
      const circleSelect = new CircleSelect();
      circleSelect.init(this);
      circleSelect.clickCount = startPoint ? 2 : 0;
      circleSelect.startPoint = null;
      circleSelect.endPoint = null;
      circleSelect.isFixRadius = isFixRadius;
      circleSelect.isShowRader = isShowRader;
      circleSelect.bShowTooltip = true;
      circleSelect.radius = radius;
      circleSelect.startPoint = startPoint;
      circleSelect.setId();
      if (radius && startPoint) {
        circleSelect.endPoint = circleSelect.getEndPoint(startPoint, radius);
        circleSelect.addCircle();
        // circleSelect.setTooltip();
        circleSelect.select();
        circleSelect.triggerDragEvent();
        circleSelect.bringbackToFront();
      } else {
        this.map.on('mousedown', circleSelect.mousedown);
        this.bDrawCircleOrRectangle = true;
      }
      if (this.currentEditPreventId) {
        const key = `${this.currentEditPreventId}_${new Date().getTime()}`;
        this.circleSelectMap.set(key, circleSelect);
      }
    }, 0);
    // ----------------------记录查询海康人脸卡口/结构化和非结构化设备标识/搜索类别---this赋值标记---
    this.isFromHK = isFromHK;
    this.isSelectAll = isSelectAll;
    this.searchType = searchType;
  };

  // 圈选地图操作
  doCircleSelect = ({ lng, lat, radius, circle, isClear }) => {
    this.showPreventCircleSaveBtn();
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

    if (this.currentEditPreventId) {
      const layerGroup = this.preventCircleMap.get(this.currentEditPreventId);
      let hasLayer = false;
      let destLayer = null;
      layerGroup.eachLayer(item => {
        if (item.id === circle.id) {
          hasLayer = true;
          destLayer = item;
        }
      });
      hasLayer && layerGroup.removeLayer(destLayer);
      !isClear && layerGroup.addLayer(circle);
    }
  };

  // 多边形操作
  doPolygonSelect = ({ points, polygon, isClear }) => {
    this.showPreventCircleSaveBtn();
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

    if (this.currentEditPreventId) {
      const layerGroup = this.preventCircleMap.get(this.currentEditPreventId);
      const hasLayer = layerGroup.hasLayer(polygon);
      const destLayer = layerGroup.getLayers().find(item => item == polygon);
      hasLayer && layerGroup.removeLayer(destLayer);
      !isClear && layerGroup.addLayer(polygon);
    }
  };

  //判断是否可以继续绘制防控圈，最多画三个图形
  getDrawAuthority() {
    if (this.currentEditPreventId) {
      const layerGroup = this.preventCircleMap.get(this.currentEditPreventId);
      if (layerGroup) {
        const num = layerGroup.getLayers().length;
        return num >= 4;
      }
    }
    return false;
  }

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
    // RectangleSelect.clear();
    // PolygonSelect.clear();
    if (this.currentEditPreventId) {
      const id = this.currentEditPreventId + '';
      for (const key of this.circleSelectMap.keys()) {
        if (key.includes(id)) {
          this.circleSelectMap.get(key).clearEvent();
        }
      }
      for (const key of this.polygonSelectMap.keys()) {
        if (key.includes(id)) {
          this.polygonSelectMap.get(key).stop();
        }
      }
    }
  };

  clearSelectById = id => {
    this.circleSelectMap.forEach((value, key) => {
      if (key.indexOf(`${id}_`) > -1) {
        value && value.clear();
      }
    });
    this.polygonSelectMap.forEach((value, key) => {
      if (key.indexOf(`${id}_`) > -1) {
        value && value.clear();
      }
    });
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
    if ((!arg._source || !arg._source.deviceBean) && !arg.deviceBean) return;
    if (!this.markerGroup) return;
    this.map.closePopup();
    const data = arg.deviceBean || arg._source.deviceBean;
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
        let { latitude, longitude } = obj.deviceBean;
        latitude = Number(latitude);
        longitude = Number(longitude);
        if (!isNaN(latitude) && !isNaN(longitude)) {
          const position = [Number(latitude), Number(longitude)];
          const attribution = {
            data: { szType: 1, ...obj.deviceBean, latitude, longitude },
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
      if (deviceData.length > 1000 && deviceData.length < 200) {
        // 测试数据
        let i = 0;
        while (i++ < 50000 - 1) {
          let obj = {};
          obj = Object.assign({}, deviceData[0]);
          obj.longitude = 120 + Math.random() / 1;
          obj.latitude = 30 + Math.random() / 1;
          obj.deviceId = i;
          obj.deviceName = '设备序号' + i;
          obj.szType = (i % 2) + 1;
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
   * 打点
   * @param icon
   * @param type
   * @param category 防空圈细分类型1分钟 3分钟 5分钟，对应值 1 3 5
   */
  initDraw = (icon, type, category) => {
    this.categoryBak = category;
    if (!this.marker_controls) {
      this.marker_controls = new L.Control.SimpleMarkers({
        add_control: false,
        delete_control: false,
        allow_popup: true,
        marker_icon: icon,
        marker_draggable: true,
        add_marker_callback: async e => {
          this.clearMouseTips();
          const { lat: latitude, lng: longitude } = e._latlng;
          let id = -1;
          if (type === 0) {
            const icon =
              this.categoryBak === 1
                ? oneMinuteDisableIcon
                : this.categoryBak === 3
                ? threeMinuteDisableIcon
                : fiveMinuteDisableIcon;
            e.setIcon(icon);
            id = await this.props
              .dispatch({
                type: 'deploy/addPointInfo',
                payload: { data: { type: category, latitude, longitude } },
              })
              .then(res => {
                if (res) {
                  this.map.removeLayer(e);
                }
              });
          } else {
            const types =
              type === 1
                ? 'map/mapEntryAndexit'
                : type === 2
                ? 'map/mapSentrybox'
                : 'map/mapTollGate';
            this.props
              .dispatch({
                type: types,
                payload: {
                  coordinate: e._latlng.lng + ',' + e._latlng.lat,
                },
              })
              .then(res => {
                if (res.code === 200) {
                  this.map.removeLayer(e);
                  message.success('图层绘制成功，请编辑图层名称 ');
                } else if (res.code === 1000) {
                  message.warning(res.message);
                } else {
                  message.error(res.message);
                }
                this.props.dispatch({
                  type: 'deploy/getDoorwayList',
                });
                this.props.dispatch({
                  type: 'deploy/getPoliceboxList',
                });
                this.props.dispatch({
                  type: 'deploy/getCheckpointList',
                });
                this.props.dispatch({
                  type: 'deploy/getDoorwayList',
                });
              });
          }
          // this.showTooltip(e, type, category, id);
          this.map.removeControl(this.marker_controls);
          this.marker_controls = null;
          this.currentSelectedPreventId = id;
        },
      });
      this.map.addControl(this.marker_controls);
    }
  };

  drawRouteMarker = (type = 0, category) => {
    const { id } = this.props;
    if (id && id !== -1) {
      // 退出
    }
    let icon = null;
    let preventCircleIcon = null;
    switch (type) {
      case 0:
        icon = addMarkerIcon; // 防空圈
        preventCircleIcon =
          category === 1 ? oneMinuteIcon : category === 3 ? threeMinuteIcon : fiveMinuteIcon;
        break;
      case 1:
        icon = disablePasswayIcon; // 出入口
        break;
      case 2:
        icon = disablePoliceBoxIcon; // 岗亭
        break;
      case 3:
        icon = disableTollStationIcon; // 检查站
        break;
    }
    this.initDraw(icon, type, category);
    this.marker_controls.enterAddMarkerMode('', category);
    this.setMouseTips('在地图上单机鼠标左键，进行点位绘制', preventCircleIcon || icon);
  };

  setMouseTips = (tips, icon) => {
    this.map.off('mousemove').on('mousemove', e => {
      this.mouseTips && this.map.removeLayer(this.mouseTips);
      this.markerTips && this.map.removeLayer(this.markerTips);
      const latlng = new L.LatLng(e.latlng.lat, e.latlng.lng);
      const tooltip = L.tooltip({
        direction: 'right',
        permanent: true,
        interactive: false,
        noWrap: true,
        opacity: 0.9,
        offset: [15, 0],
      });

      tooltip.setContent(tips);
      tooltip.setLatLng(latlng);
      tooltip.addTo(this.map);
      const markerTips = L.marker(latlng, { icon }).addTo(this.map);
      this.mouseTips = tooltip;
      this.markerTips = markerTips;
    });
  };

  clearMouseTips = () => {
    this.mouseTips && this.map.off('mousemove').removeLayer(this.mouseTips);
    this.markerTips && this.map.off('mousemove').removeLayer(this.markerTips);
  };

  showTooltip = (mk, type, category, id) => {
    if (type === 0) {
      const icon =
        category === 1
          ? oneMinuteHighLightIcon
          : category === 3
          ? threeMinuteHighLightIcon
          : fiveMinuteHighLightIcon;
      const name = category === 1 ? '1分钟防空圈' : category === 3 ? '3分钟防空圈' : '5分钟防空圈';
      mk.id = mk.id || 'prevent_' + new Date().getTime();
      const tooltip = `<div class="preventCircle">
                          <span>${name}</span>
                            <span>
                            <img id="${mk.id}"
                                src=${deleteMarkeImg}
                                onclick="gmap.delateConfigMarker(this)"
                                class="deleteMarkeImgClass"
                            />
                          </span>
                          <span class="preventCircle-btn" category="${category}" onclick="gmap.savePrevent(this)">保存</span>
                        </div>`;

      this.preventCircleMap.set(mk.id, L.layerGroup().addLayer(mk)); // zjt
      this.currentEditPreventId = mk.id;
      this.currentEditPreventType = category;
      const { basicDeployModalVisible, isShowEditor, isControlTopicEdit, dispatch } = this.props;
      mk.off('click')
        .setOpacity(0.01)
        .on('click', e => {
          //下面三行苏泽写的,别删
          // if (basicDeployModalVisible || isShowEditor || isControlTopicEdit) {
          //   confirm({
          //     title: '您当前正在编辑,是否退出?',
          //     okText: '退出',
          //     cancelText: '取消',
          //     onOk: () => {
          //       dispatch({
          //         type: 'deploy/openBasicModal',
          //         payload: {
          //           circleType: category,
          //           id,
          //         },
          //       });
          //     },
          //   });
          // }

          e.target
            .setOpacity(0.01)
            // .setIcon(icon)
            // .closePopup()
            // .bindPopup(tooltip, {
            //   permanent: false,
            //   direction: 'top',
            //   // offset: [0, -26],
            //   autoClose: false,
            //   closeOnClick: false,
            //   closeButton: false,
            // })
            // .openPopup()
            .dragging.disable();
          const layerGroup = this.preventCircleMap.get(e.target.id);
          const layer = layerGroup.hasLayer(e.target);
          !layer && layerGroup.addLayer(mk);
        });
    } else if (type > 0 && type < 4) {
      mk.setOpacity(0.01).on('click', () => {
        const { lat, lng } = mk.getLatLng();
        mk.id = mk.id || 'checkPoint_' + new Date().getTime();
        mk.markerId = mk.id + '_marker';
        const name = this.poiMap.get(mk.id) || '';
        const popup = L.popup().setContent(`<div>
            <div class="poiContent">
                <div style="margin-top: 20px;">
                    <span>经度：</span><input value="${lng}" class="lng"/>
                </div>
                <div>
                    <span>纬度：</span><input value="${lat}" class="lat"/>
                </div>
                <div>
                    <span>名称：</span><input class="name" value="${name}" maxLength="12" onKeypress="javascript:if(event.keyCode == 32)event.returnValue = false;" />
                </div>
            </div>
            <div class="footer" style="margin-top: 10px; text-align: center;" >
                <button onClick="gmap.savePoi(this)" type="${type}" id="${mk.id}">保存</button>
                <button onClick="gmap.deletePoi(this)" type="${type}" markerId="${mk.markerId}">删除</button>
            </div>
        </div>`);
        mk.bindPopup(popup).openPopup();
        this.poiMap.set(mk.markerId, mk);
      });
    }
  };

  setPreventCircleEditable = (id, category, layers = []) => {
    this.setModelPreventCircleId(id);
    this.preventCircleMap.set(id, L.layerGroup());
    this.currentEditPreventId = id;
    this.currentEditPreventType = category;
    const layerGroup = this.preventCircleMap.get(id);
    layers.forEach(item => {
      const haslayer = layerGroup.hasLayer(item);
      !haslayer && layerGroup.addLayer(item);
    });
    this.props.dispatch({
      type: 'map/setPreventCircleNumber',
      payload: {
        preventCircleNumber: layers.length - 1,
      },
    });
    this.bSavePrevent = true;
  };
  /**
   * 设置model/map.js里state：selectedPreventId的值
   * @param id
   */
  setModelPreventCircleId = id => {
    this.props.dispatch({
      type: 'map/setSelectedPreventId',
      payload: {
        selectedPreventId: id,
      },
    });
  };

  setMarkerLatLngOfPreventCircle = (id, latlng) => {
    const layerGroup = this.preventCircleMap.get(id);
    if (layerGroup) {
      const layers = layerGroup.getLayers();
      layers.forEach(layer => {
        if (layer._icon || layer.options.icon) {
          layer.setLatLng(latlng);
        }
      });
    }
  };

  showPreventCircleSaveBtn() {
    const html = document.getElementsByClassName('preventCircle-btn');
    if (html.length > 0) {
      html[0].style.display = 'initial';
    }
  }

  savePrevent = (e, bCallCallback = true) => {
    const { recoverState } = this.props;
    const layerGroup = this.preventCircleMap.get(this.currentEditPreventId);
    if (!layerGroup) return;

    const circleType = isFinite(e) ? e : e.attributes['category'].value;
    const { id } = this.props;
    let latlng = null;
    var json = L.layerGroup().toGeoJSON();

    layerGroup.eachLayer(item => {
      const feature = item.toGeoJSON();
      const isMarker =
        feature.geometry.type === 'Point' && !feature.properties.hasOwnProperty('radius');
      const isCircle =
        feature.geometry.type === 'Point' && feature.properties.hasOwnProperty('radius');
      if (!item.getRadius && (item._icon || isMarker)) {
        latlng = item.getLatLng();
        feature.properties = {
          type: circleType,
        };
      } else if ((!item._icon && item.getRadius) || isCircle) {
        feature.properties.radius = feature.properties.radius || item.getRadius();
      }
      if (item.typeObj) {
        feature.properties.typeObj = item.typeObj;
      }
      json.features.push(feature);
    });
    const { dispatch } = this.props;
    dispatch({
      type: 'map/updatePreventCircle',
      payload: {
        id: this.currentEditPreventId,
        selectionJson: JSON.stringify(json),
      },
    }).then(res => {
      const { code } = res;
      if (code === 200) {
        message.info('保存成功');
        if (bCallCallback) {
          this.removeLayerGroupFromPreventMap(this.currentEditPreventId);
          dispatch({
            type: 'map/setBPpreventCircleEditable',
            payload: {
              bPpreventCircleEditable: false,
            },
          });
        }
      } else {
        message.warn('保存失败');
      }
    });
    dispatch({
      type: 'map/setPreventCircleNumber',
      payload: {
        preventCircleNumber: layerGroup.getLayers().length - 1,
      },
    });
    this.bSavePrevent = true;
  };

  removeLayerGroupFromPreventMap = id => {
    if (!isFinite(id) || id === '') return;
    const layerGroup = this.preventCircleMap.get(id);
    if (layerGroup) {
      const layers = layerGroup.getLayers();
      layers.forEach(layer => this.map.removeLayer(layer));
    }
    this.clearSelectById(id);
    // this.preventCircleMap.delete(id);
  };

  savePoi(e) {
    const type = e.getAttribute('type');
    const id = e.getAttribute('id');
    const lat = e.parentElement.parentNode.getElementsByClassName('lat')[0].value;
    const lng = e.parentElement.parentNode.getElementsByClassName('lng')[0].value;
    let name = e.parentElement.parentNode.getElementsByClassName('name')[0].value;
    if (name === '') {
      message.warning('请输入名称');
    } else {
      this.poiMap.set(id, name);
      if (type === '1') {
        // 出入口
        this.props
          .dispatch({
            type: 'map/mapEntryAndexit',
            payload: {
              coordinate: lng + ',' + lat,
              kakouName: name,
            },
          })
          .then(res => {
            if (res.code === 200) {
              message.success(res.message);
              this.map.closePopup();
            } else if (res.code === 1000) {
              message.warning(res.message);
            } else {
              message.error(res.message);
            }
            this.props.dispatch({
              type: 'deploy/getDoorwayList',
            });
          });
      } else if (type === '2') {
        // 岗亭
        this.props
          .dispatch({
            type: 'map/mapSentrybox',
            payload: {
              coordinate: lng + ',' + lat,
              title: name,
            },
          })
          .then(res => {
            if (res.code === 200) {
              message.success(res.message);
              this.map.closePopup();
            } else if (res.code === 1000) {
              message.warning(res.message);
            } else {
              message.error(res.message);
            }
            this.props.dispatch({
              type: 'deploy/getPoliceboxList',
            });
          });
      } else if (type === '3') {
        // 检查站
        this.props
          .dispatch({
            type: 'map/mapTollGate',
            payload: {
              coordinate: lng + ',' + lat,
              title: name,
            },
          })
          .then(res => {
            if (res.code === 200) {
              message.success(res.message);
              this.map.closePopup();
            } else if (res.code === 1000) {
              message.warning(res.message);
            } else {
              message.error(res.message);
            }
            this.props.dispatch({
              type: 'deploy/getCheckpointList',
            });
          });
      }
    }
  }

  deletePoi(e) {
    const type = e.getAttribute('type');
    const lat = e.parentElement.parentNode.getElementsByClassName('lat')[0].value;
    const lng = e.parentElement.parentNode.getElementsByClassName('lng')[0].value;
    const name = e.parentElement.parentNode.getElementsByClassName('name')[0].value;
    const markerId = e.getAttribute('markerId');
    const mk = this.poiMap.get(markerId);
    mk && this.map.removeLayer(mk);
  }

  delateConfigMarker = e => {
    confirm({
      title: '删除确认',
      content: '您确认删除此防控圈吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { id } = this.props;
        const mkId = e.attributes.id.value;
        const layerGroup = this.preventCircleMap.get(mkId);
        if (layerGroup) {
          layerGroup.eachLayer(item => this.map.removeLayer(item));
        }
        this.clearSelectEvent();
        id !== -1 &&
          this.props
            .dispatch({
              type: 'map/deletePreventCircle',
              payload: id,
            })
            .then(res => {
              const { code } = res;
              if (code === 200) {
                message.info('删除成功');
                this.props.dispatch({
                  type: 'deploy/resetForm',
                });
              } else {
                message.warn('删除失败');
              }
            });
      },
      onCancel: () => {},
    });
  };

  /**
   * 关闭防控圈详情框
   */
  recoverLayerState = () => {
    if (this.bDrawCircleOrRectangle) {
      return;
    }
    // 防控圈是否处于编辑状态
    const { dispatch, recoverState, recoverCheckState } = this.props;
    const { bPpreventCircleEditable } = this.props;

    if (this.bSavePrevent) {
      dispatch({
        type: 'deploy/getControlCircleWithOrganizationAndNotDeploy',
      }).then(res => {
        this.bSavePrevent = false;
        if (!bPpreventCircleEditable) {
          dispatch({
            type: 'map/setSelectedPreventId',
            payload: {
              selectedPreventId: null,
            },
          });
          this.currentEditPreventId &&
            this.removeLayerGroupFromPreventMap(this.currentEditPreventId);
          recoverState();
          dispatch({ type: 'deploy/resetForm' });
        }
      });
    }
    dispatch({
      type: 'map/setSelectedCheckPointId',
      payload: { selectedCheckPointId: null },
    });
    dispatch({
      type: 'map/setSelectedPoliceId',
      payload: { selectedPoliceId: null },
    });
    dispatch({
      type: 'map/setSelectedPoliceAlarmId',
      payload: { selectedPoliceAlarmId: null },
    });
    recoverCheckState();
    this.state.bDoSelect = false;
  };

  render() {
    window.gmap = this;
    const {
      draggedCircle,
      videoJsOptions,
      bDoSelect,
      mapSelectData,
      alarmData,
      videoLayerChecked, // 视频点位图层可见
      faceLayerChecked, // 人脸点位图层可见
      carLayerChecked, // 车辆点位图层可见
    } = this.state;
    // eslint-disable-next-line react/prop-types
    const { deviceData = [], deviceTreeMap = [], layerChecked } = this.props;
    deviceTreeMap.map(item => (item.szType = 1));
    let deviceDataArr = [];
    if (Array.isArray(deviceData)) deviceDataArr = deviceDataArr.concat(deviceData);
    if (Array.isArray(deviceTreeMap)) deviceDataArr = deviceDataArr.concat(deviceTreeMap);

    const videoMarkers = this.createVideoMarkersData(
      this.__deviceData || deviceDataArr,
      videoJsOptions,
    );
    if (mapSelectData && mapSelectData.length > 0) {
      // this.setDeviceListIcon(mapSelectData, videoSelectedIcon);
      // ----------------------记录后台返回的地图选择结果-------------this赋值标记------------------
      this.mapSelectData = mapSelectData;
    }

    this.setRealtimeControlCenter(videoMarkers);
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

    // 关闭点位跳跃动效
    if (bDoSelect) {
      //   mapSelectData.forEach((item, index) => {
      //     const latLng = wgs84togcj02(Number(item.longitude), Number(item.latitude));
      //     const lonLat = L.latLng(...latLng);
      //     setTimeout(() => {
      //       L.marker(L.latLng(lonLat), { icon: videoSelectedIcon, data: item, ...this.getBounceMarkerOptions() }).addTo(this.map);
      //     }, 100 * index);
      //   });
    }

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
        <DrawPanel />
        <LayersControl position="topright" collapsed={false}>
          <LayersControl.Overlay checked={layerChecked.checkPoint} name="环城圈">
            <CheckPoint editable={true} />
          </LayersControl.Overlay>
          <LayersControl.Overlay checked={layerChecked.preventCircle} name="防控圈">
            <PreventCircle editable={true} />
          </LayersControl.Overlay>
        </LayersControl>
      </Map>
    );
  }
}

export default connect(({ map, deploy }) => {
  return {
    savePoi: map.savePoi,
    basicDeployModalVisible: deploy.basicDeployModalVisible,
    areaDeployModalVisible: deploy.areaDeployModalVisible,
    isShowEditor: deploy.isShowEditor,
    isControlTopicEdit: deploy.isControlTopicEdit,
    id: deploy.id,
    layerChecked: map.layerChecked,
    bPpreventCircleEditable: map.bPpreventCircleEditable,
    recoverState: map.recoverState,
    recoverCheckState: map.recoverCheckState,
  };
})(SKMap);
