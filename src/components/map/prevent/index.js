import React, { Component, createRef } from 'react';
import { connect } from 'dva';
import { Modal, message } from 'antd';
import { GeoJSON, LayerGroup, Marker } from 'react-leaflet';
import {
  oneMinuteIcon,
  threeMinuteIcon,
  fiveMinuteIcon,
  oneMinuteHighLightIcon,
  threeMinuteHighLightIcon,
  fiveMinuteHighLightIcon,
  oneMinuteDisableIcon,
  threeMinuteDisableIcon,
  fiveMinuteDisableIcon,
  saveDivIcon,
  editDivIcon,
} from '../constant/index';
import { deleteMarkeImg, deleterMarkerIcon } from '../constant/index';
import { isBasicDeployEdit } from '@/utils/tool';
import router from 'umi/router';

const { L } = window;
const { confirm } = Modal;

class PreventCircle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      color: 'blue',
      dragArgs: null,
      editArgs: null,
      bStartEdit: false,
      bShowSaveBtn: true,
    };
    this.data = [];
    this.refList = new Map();
    this.selectedDraggedPreventCircle = null;
    this.selectedEditedPreventCircle = null;
    this.orginLatlngMap = new Map();
    this.selectedPreventId = null;
    this.selectedPreventNameMap = new Map();
    this.selectedPreventType = null;
    this.bMarkerClicked = false; // 防控圈marker单击标记
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'map/locationPreventCircle',
      payload: {
        locationPreventCircle: this.loaction,
      },
    });
    this.props.dispatch({
      type: 'map/closeThePreventCircle',
      payload: {
        closeThePreventCircle: this.closeThePreventCircle,
      },
    });
    this.props.dispatch({
      type: 'map/recoverState',
      payload: {
        recoverState: this.recoverState,
      },
    });
  }
  onEachFeature = (feature, layer) => {
    const { bStartEdit } = this.state;
    const { editable } = this.props;
    const { name, radius, id } = feature.properties;
    if (name && !radius && feature.geometry.type === 'Point') {
      !editable
        ? layer.bindTooltip(feature.properties.name, {
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            permanent: true,
            direction: 'top',
            offset: [0, -32],
          })
        : layer.bindTooltip(feature.properties.name, {
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            permanent: true,
            direction: 'top',
            offset: [0, -32],
          });
    }
    if (id === this.selectedPreventId && bStartEdit) {
      // layer.options.opacity = 0;
    }
  };
  pointToLayer = (feature, latlng) => {
    const { editable } = this.props;
    const { bStartEdit } = this.state;
    const { radius, type, id, name } = feature.properties;
    const bHightLight = this.selectedPreventId === id;
    const icon = this.getIcon(feature.properties);
    const draggable =
      editable && (bStartEdit || name === '' || !name) && this.selectedPreventId === id;
    return radius
      ? L.circle(latlng, radius)
      : L.marker(latlng, {
          icon,
          draggable,
          data: feature,
          latlng,
        })
          .on('dragstart', e => this.dragStartHander(e))
          .on('dragend', e => this.dragEndHander(e));
    // .on('mouseover', (e) => this.mouseoverHandler(e))
    // .on('mouseout', (e) => this.mouseoutHandler(e));
  };
  getIcon = data => {
    const { radius, type, id, name } = data;
    const bHightLight = this.selectedPreventId === id;
    const icon = bHightLight
      ? type == '1'
        ? oneMinuteHighLightIcon
        : type == '3'
        ? threeMinuteHighLightIcon
        : fiveMinuteHighLightIcon
      : name === '' || !name
      ? type == '1'
        ? oneMinuteDisableIcon
        : type == '3'
        ? threeMinuteDisableIcon
        : fiveMinuteDisableIcon
      : type == '1'
      ? oneMinuteIcon
      : type == '3'
      ? threeMinuteIcon
      : fiveMinuteIcon;
    return icon;
  };
  onAdd(e) {
    e.target.eachLayer(function(layer) {
      if (layer.feature.geometry.type === 'Point') {
        // layer.openPopup();
      }
    });
  }
  onClick = e => {
    L.DomEvent.stopPropagation(e); //阻止事件往map方向冒泡
    const {
      dispatch,
      controlCircleWithOrganization,
      basicDeployModalVisible,
      areaDeployModalVisible,
      basicDeployForm,
      testForm,
      isShowEditor,
      isControlTopicEdit,
      bPpreventCircleEditable,
      mapAction,
    } = this.props;
    const { bStartEdit, bShowSaveBtn } = this.state;
    if ((bStartEdit && bPpreventCircleEditable) || bStartEdit) {
      return;
    }

    const { setPreventCircleEditable, clearSelectById } = this.props.mapAction;
    let dispatchFlag = true;
    const { pathname } = window.location;
    const isConfigPage = pathname.includes('deploy');
    let _id = null;
    let _name = '';
    let isAnotherClick = false;
    const layers = e.target
      .getLayers()
      .sort((a, b) => (b.feature.properties.id || 0) - (a.feature.properties.id || 0));

    // e.target.eachLayer(layer => {
    layers.forEach(layer => {
      const { geometry, properties } = layer.feature;
      const { type, coordinates } = geometry;
      const { radius, id, name, type: circleType } = properties;
      isAnotherClick =
        this.selectedPreventId && this.selectedPreventId !== -1 && this.selectedPreventId !== id;
      if (id) {
        _id = id;
        _name = name;
      }
      if (isAnotherClick && dispatchFlag && isConfigPage) {
        this.getControlCircleData();
        clearSelectById(this.selectedPreventId);
        this.bMarkerClicked = false;
        this.setState({
          bStartEdit: this.bMarkerClicked,
          dragArgs: null,
          editArgs: null,
        });
      }
      if (!this.bMarkerClicked && dispatch && dispatchFlag) {
        if (isConfigPage) {
          if (
            isBasicDeployEdit(testForm) ||
            (areaDeployModalVisible && (isShowEditor || isControlTopicEdit))
          ) {
            confirm({
              title: '您当前正在编辑,是否退出?',
              okText: '退出',
              cancelText: '取消',
              onOk: () => {
                this.openModal(name, id, circleType);
              },
            });
          } else {
            this.openModal(name, id, circleType);
          }

          dispatchFlag = false;
          this.selectedPreventId = id;
          this.selectedPreventNameMap.set(id, name);
          this.selectedPreventType = circleType;
          setPreventCircleEditable(id, circleType, this.getTheLayers(id, e.target.getLayers()));
          this.setState({
            dragArgs: null,
            editArgs: null,
          });
        } else {
          // 135系列图标点击路由跳转至135，关闭警情弹窗
          if (!pathname.includes('/fight/135')) {
            router.push('/fight/135');
            dispatch({
              type: 'policeSentiment/setPoliceAlarmPopupVisible',
              payload: {
                policePopupVisible: false,
              },
            });
          }
          dispatch({
            type: 'fight/modal135ChangeFn',
            payload: {
              show: true,
              data: properties,
            },
          });
          dispatch({
            type: 'fight/save',
            payload: { id },
          });
          dispatch({
            type: 'fight/get135Camera',
            payload: { id },
          });
          dispatch({
            type: 'fight/get135AroundPolice',
            payload: { id },
          });
          dispatchFlag = false;
          this.selectedPreventId = id;
        }
      } else if (this.bMarkerClicked && dispatch && dispatchFlag) {
        if (pathname.includes('deploy')) {
          dispatch({ type: 'deploy/resetForm' });
        } else {
          dispatch({
            type: 'fight/modal135ChangeFn',
            payload: {
              show: false,
            },
          });
        }
        this.selectedPreventId = null;
      }
      if (layer.feature.geometry.type !== 'Point' || radius) {
        const unselectedColor = 'blue';
        const selectedColor = '#ff7800';
        const color = !e.target.clicked ? selectedColor : unselectedColor;
        layer.setStyle({
          color,
        });
        this.setState({ color });
      } else if (layer.feature.geometry.type === 'Point' && !radius) {
        this.setState({
          editArgs: !this.bMarkerClicked ? layer.feature.geometry.coordinates.reverse() : null,
        });
      }
    });
    // console.log(this.selectedPreventId, 'this.selectedPreventId');
    dispatch({
      type: 'map/setSelectedPreventId',
      payload: {
        selectedPreventId: !this.bMarkerClicked ? _id : null,
      },
    }).then(() => {
      if (this.bMarkerClicked) {
        this.selectedEditedPreventCircle = e.target.options.data;
        this.selectedPreventId = _id;
        this.setState({ bShowSaveBtn: true });
      } else {
        this.selectedEditedPreventCircle = null;
        this.selectedPreventId = null;
        this.setState({ bShowSaveBtn: false });

        const { getMapState, savePrevent, setMapStateOfBDoSelect } = mapAction;
        const { bDoSelect } = getMapState();
        if (bDoSelect) {
          savePrevent(this.selectedPreventType);
          !isAnotherClick && this.getControlCircleData();
          setMapStateOfBDoSelect(false);
        }
        if (_name === '') {
          this.getControlCircleData();
          this.recoverState();
        }
      }
    });
    this.bMarkerClicked = !this.bMarkerClicked;
  };
  openModal = (name, id, circleType) => {
    if (name) {
      this.props.dispatch({
        type: 'deploy/openEditModal',
        payload: { id },
      });
    } else {
      this.props.dispatch({
        type: 'deploy/openBasicModal',
        payload: { id, circleType },
      });
    }
  };
  onHover = () => {};
  getTheLayers = (id, layers) => {
    let rst = layers;
    const json = this.getNewestGeoJSONById(id);
    if (json) {
      rst = L.geoJSON(json).getLayers();
    }
    return rst;
  };
  getNewestGeoJSONById = id => {
    let rst = null;
    const { controlCircleWithOrganization } = this.props;
    controlCircleWithOrganization.forEach(item => {
      const { preventions = [] } = item;
      preventions.forEach(ii => {
        const { selectionJson } = ii;
        if (ii.id === id && selectionJson && selectionJson !== '') {
          const json = JSON.parse(selectionJson);
          if (json) {
            rst = json;
          }
        }
      });
    });
    return rst;
  };
  createMarker(ii) {
    const { type, longitude, latitude } = ii;
    const icon = type === 1 ? oneMinuteIcon : type === 3 ? threeMinuteIcon : fiveMinuteIcon;
    const latlng = [latitude, longitude];
    const json = L.marker(latlng, { icon }).toGeoJSON();
    json.properties = ii;
    return json;
  }
  pointToDeleteMarkerLayer = (feature, latlng) => {
    const icon = deleterMarkerIcon;
    return L.marker(latlng, {
      icon,
      data: feature,
    });
  };
  dragStartHander = e => {
    this.dragStartLatlng = e.target.getLatLng();
  };
  dragEndHander = e => {
    const { setMarkerLatLngOfPreventCircle, savePrevent } = this.props.mapAction;
    const { id, properties } = e.target.options.data;
    this.selectedPreventId = id || properties.id;
    const { type, name } = properties;
    const orgignLatlng = this.orginLatlngMap.get(this.selectedPreventId);
    if (orgignLatlng) {
      const destLatlng = e.target.getLatLng();
      const offsetLat = destLatlng.lat - orgignLatlng[1];
      const offsetLng = destLatlng.lng - orgignLatlng[0];
      this.setState({
        dragArgs: {
          offsetLat,
          offsetLng,
          id: this.selectedPreventId,
          destLatlng,
        },
        editArgs: [destLatlng.lat, destLatlng.lng],
      });
      this.setState({ bShowSaveBtn: true });
      setMarkerLatLngOfPreventCircle && setMarkerLatLngOfPreventCircle(id, destLatlng);
      savePrevent && savePrevent(type, name === '');
    }
  };
  mouseoverHandler = e => {
    this.setState({
      editArgs: e.target.getLatLng(),
    });
  };
  mouseoutHandler = e => {
    this.setState({
      editArgs: null,
    });
  };
  onDelete = item => {
    const { clearSelectById } = this.props.mapAction;
    const id =
      item.type === 'FeatureCollection' ? item.features[0].properties.id : item.properties.id;
    const { dispatch } = this.props;
    const content =
      item.name !== '' && item.name
        ? '该图层已配置完成，一旦删除，信息将无法恢复，请确认是否删除!'
        : '请确认是否删除当前防控圈！';
    confirm({
      title: `${item.name}`,
      content,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        dispatch({
          type: 'map/deletePreventCircle',
          payload: id,
        }).then(res => {
          const { code } = res;
          if (code === 200 || code === 1002) {
            code === 200 && message.info('删除成功！');
            code === 1001 && message.info('此防控圈已删除！');
            this.getControlCircleData();
            clearSelectById(id);
            dispatch({
              type: 'deploy/resetForm',
            });
            this.setBPpreventCircleEditable(false);
            // editable && editArgs && bShowSaveBtn && selectedPreventId
            this.setState({ bShowSaveBtn: false, editArgs: null, bStartEdit: false });
            this.selectedPreventId = null;
            this.bMarkerClicked = false;
          } else {
            message.warn('删除失败！');
          }
        });
      },
      onCancel: () => {},
    });
  };
  getControlCircleData() {
    this.props.dispatch({
      type: 'deploy/getControlCircleWithOrganizationAndNotDeploy',
    });
  }
  onSave = e => {
    e.originalEvent.preventDefault();
    const { bStartEdit } = this.state;
    const { CircleSelectFn, PolygonSelectFn, setPreventCircleEditable } = this.props.mapAction;
    const id = this.selectedPreventId;
    if (bStartEdit) {
      // 保存
      const { setPreventCircleEditable, savePrevent } = this.props.mapAction;
      // const sdpc = this.selectedDraggedPreventCircle;
      // const layers = L.geoJSON(sdpc).getLayers();
      const circleType = this.selectedPreventType;
      // setPreventCircleEditable(id, circleType, layers);
      savePrevent(circleType);
      this.setState({ bShowSaveBtn: true, bStartEdit: false });
      // this.setState({ dragArgs: null });
    } else {
      // 编辑
      const json = this.getNewestGeoJSONById(id);
      const fs = json ? json.features : this.selectedEditedPreventCircle.features;
      if (this.selectedEditedPreventCircle && fs && fs.length > 0) {
        if (this.selectedPreventType) {
          const sepc = this.selectedEditedPreventCircle;
          let layers = L.geoJSON(sepc).getLayers();
          // console.log('layers', layers);
          layers = layers.filter(ly => {
            const { properties, geometry } = ly.feature;
            return geometry.type === 'Point' && !properties.radius;
          });
          if (layers.length > 0) {
            const marker = layers[0];
            const { lat, lng } = marker.getLatLng();
            layers[0] = marker.setLatLng([lng, lat]);
          }
          setPreventCircleEditable(id, this.selectedPreventType, layers);
        }
        fs.forEach(item => {
          const { properties, geometry } = item;
          const { radius } = properties;
          const { coordinates, type } = geometry;
          if (radius) {
            CircleSelectFn({
              startPoint: L.latLng(...coordinates.reverse()),
              radius,
            });
          } else if (type === 'Polygon') {
            PolygonSelectFn({
              coordinates: coordinates[0].map(item => item.reverse()),
            });
          }
        });
      }
      // this.setBPpreventCircleEditable(true);
      this.setState({
        bStartEdit: true,
      });
    }
  };
  setBPpreventCircleEditable = bPpreventCircleEditable => {
    this.props.dispatch({
      type: 'map/setBPpreventCircleEditable',
      payload: {
        bPpreventCircleEditable: bPpreventCircleEditable,
      },
    });
  };
  getMarker = item => {
    const feat = item.features.find(ii => ii.geometry.type === 'Point' && !ii.properties.radius);
    const { coordinates } = feat.geometry;
    return L.marker(coordinates.reverse());
  };
  loaction = data => {
    const { fitBounds } = this.props.mapAction;
    const { id } = data;
    const dest = this.data.find(item => {
      const cell = item.type === 'FeatureCollection' ? item.features[0] : item;
      return cell.properties.id === id;
    });
    const destGeoJSON = L.geoJSON(dest);
    fitBounds(destGeoJSON.getBounds());
    // this.selectedPreventId = id;
    const color = '#ff7800';
    this.setState({ color });

    const { current } = this.refList.get(id + '') || {};
    if (current) {
      current.leafletElement.fireEvent('click');
    }
  };
  closeThePreventCircle = data => {
    this.recoverState();
    // const key = 'geojson' + this.getId(data);
    // const { current } = this.refList.get(key) || {};
    // if (current) {
    //   current.leafletElement.eachLayer(layer => {
    //     const { geometry, properties } = layer.feature;
    //     const { radius } = properties;
    //     if (geometry.type !== 'Point' || radius) {
    //       const unselectedColor = 'blue';
    //       const selectedColor = '#ff7800';
    //       layer.setStyle({
    //         color: unselectedColor,
    //       });
    //     }
    //   });
    // }
  };
  /**
   * 设置key，策略如下：防控圈名字更新后刷新，拖动后刷新
   * @param item
   * @returns {string|*}
   */
  getId(item) {
    let rst = '';
    const { dragArgs, bStartEdit, bShowSaveBtn } = this.state;
    const { editable } = this.props;
    const { type, features = [] } = item;
    // const { getCurrentSelectedPreventId } = this.props.mapAction;
    const selectedPreventId = this.selectedPreventId;

    let hasName = false;
    let _type = '';
    let _name = '';
    let _id = '';
    if (type === 'FeatureCollection') {
      const point = features.find(
        item => item.geometry.type === 'Point' && !item.properties.hasOwnProperty('radius'),
      );
      if (point) {
        const name = point.name || point.properties.name;
        hasName = name !== '' && name;
        _name = name;
        _type = point.properties.type;
        _id = point.properties.id;
      }
    } else if (type === 'Feature') {
      const name = item.name || item.properties.name;
      hasName = name !== '' && name;
      _name = name;
      _type = item.properties.type;
      _id = item.properties.id;
    }
    let num = 0;
    features.forEach(item => {
      const { coordinates } = item.geometry;
      if (item.id === 955 && !isFinite(coordinates[0])) debugger;
      num += coordinates.toString();
    });

    if (hasName && !dragArgs) {
      rst = bStartEdit
        ? `${_id}_${_type}_${_name}_${features.length}_${num}_${bStartEdit}_${bShowSaveBtn}`
        : `${_id}_${_type}_${_name}_${features.length}_${num}_${bStartEdit}_${bShowSaveBtn}_${this.selectedPreventId}`;
      // console.log(rst);
    } else if (
      selectedPreventId &&
      selectedPreventId !== -1 &&
      _id === selectedPreventId &&
      this.props.selectedPreventId !== null
    ) {
      if (!dragArgs) {
        rst = `${_id}_${_type}_${_name}_${features.length}_${selectedPreventId}_${bStartEdit}_${num}`;
      } else {
        rst = `${_id}_${_type}_${_name}_${features.length}_${selectedPreventId}_${bStartEdit}_${num}_${dragArgs.offsetLat}_${dragArgs.offsetLng}`;
      }
      // return item.id + '_' + selectedPreventId + '_disableEdit';
    } else {
      rst = editable ? `${_id}_${bStartEdit}_${num}` : `${_id}_${bStartEdit}_${num}_disableEdit`;
      // console.log(rst);
    }
    if (item.id === 955 && rst !== this.lastRst) {
      console.log(rst, this.selectedPreventId);
      this.lastRst = rst;
    }
    return rst;
  }
  getRef = (item, pre = '') => {
    let key = pre + this.getId(item);
    key = key.split('_')[0];
    let r = this.refList.get(key);
    if (!r) {
      r = createRef();
      this.refList.set(key, r);
    }
    return r;
  };
  getData = item => {
    const { id, features } = item;
    const { bStartEdit } = this.state;
    const b = id && id == this.selectedPreventId && bStartEdit;
    if (b && Array.isArray(features)) {
      const _features = features.filter(
        item => item.geometry.type === 'Point' && !item.properties.radius,
      );
      item.features = _features;
      return item;
    } else {
      return item;
    }
  };
  addDraggedLatlng = (cell, dragArgs, isSet = false) => {
    cell.map((item, index) => {
      const { type } = item;
      const feature = type === 'FeatureCollection' ? item.features[0] : item;
      const { geometry, properties } = feature;
      const { coordinates } = geometry;
      const { id, name } = properties;
      item.id = id;
      item.name = name;
      if (id === this.selectedPreventId && dragArgs) {
        if (type === 'Feature') {
          const lat = coordinates[1] + dragArgs.offsetLat;
          const lng = coordinates[0] + dragArgs.offsetLng;
          item.geometry.coordinates = [lng, lat];
        } else if (type === 'FeatureCollection') {
          item.features.map(feat => {
            const { coordinates: xy, type } = feat.geometry;
            const { radius } = feat.properties;
            if (type === 'Point' && !radius) {
              // 圆不移动
              const lat = xy[1] + dragArgs.offsetLat;
              const lng = xy[0] + dragArgs.offsetLng;
              feat.geometry.coordinates = [lng, lat];
            } else if (type === 'Polygon') {
              // 矩形不移动
              // feat.geometry.coordinates[0] = xy[0].map(j => {
              //   const lat = j[1] + dragArgs.offsetLat;
              //   const lng = j[0] + dragArgs.offsetLng;
              //   return [lng, lat];
              // });
            }
          });
        }
        isSet && (this.selectedDraggedPreventCircle = cell[index]);
      }
    });
    return cell;
  };
  recoverState = () => {
    this.bMarkerClicked = false;
    this.selectedPreventId = null;
    this.setState({
      color: 'blue',
      dragArgs: null,
      editArgs: null,
      bStartEdit: false,
      bShowSaveBtn: false,
    });
  };
  changeEditStateFromName = data => {
    const { id, name } = data;
    if (this.selectedPreventNameMap.get(id) === '') {
      this.selectedEditedPreventCircle = data;
      this.selectedPreventNameMap.set(id, name);
    }
  };
  render() {
    window.g_p = this;
    // const data =  JSON.stringify(gdata);
    let { controlCircleWithOrganization, editable, mapAction, selectedPreventId } = this.props;
    const { getCurrentSelectedPreventId } = mapAction;
    const { color, dragArgs, editArgs, bStartEdit, bShowSaveBtn } = this.state;

    let data = [];
    let delData = [];
    let saveData = [];

    if (selectedPreventId !== -1 && this.selectedPreventId) {
      this.selectedPreventId = selectedPreventId;
      if (!selectedPreventId) {
        this.bMarkerClicked = false;
      }
    }

    controlCircleWithOrganization.forEach(item => {
      const { preventions = [] } = item;
      preventions.forEach((ii, jj) => {
        const { selectionJson, type, id, name, longitude, latitude } = ii;
        if (id === this.selectedPreventId && name && name !== '') {
          this.changeEditStateFromName(ii);
        }
        if (selectionJson && selectionJson !== '') {
          try {
            let json = JSON.parse(selectionJson);
            let properties = null;
            json.features.map(f => {
              if (f.geometry.type === 'Point') {
                f.properties = {
                  ...ii,
                  ...f.properties,
                  type,
                };
                f.properties.name = name;
                f.properties.preventCircleId = id;
                if (!f.properties.hasOwnProperty('radius')) {
                  this.orginLatlngMap.set(id, f.geometry.coordinates);
                  properties = f.properties;
                }
              }
              f.properties.preventCircleId = id;
            });
            json = { ...properties, ...json };
            const jsonClone = JSON.parse(JSON.stringify(json));
            jsonClone.features = jsonClone.features.filter(
              f => f.geometry.type === 'Point' && !f.properties.hasOwnProperty('radius'),
            );
            data.push(json);
            if (id === this.selectedPreventId) delData.push(jsonClone);
          } catch (e) {
            data.push(this.createMarker(ii));
            if (id === this.selectedPreventId) delData.push(this.createMarker(ii));
            this.orginLatlngMap.set(id, [longitude, latitude]);
          }
        } else {
          const icon = type == '1' ? oneMinuteIcon : type == '3' ? threeMinuteIcon : fiveMinuteIcon;
          const latlng = [latitude, longitude];
          if (isFinite(latitude) && isFinite(longitude)) {
            data.push(this.createMarker(ii));
            if (id === this.selectedPreventId) delData.push(this.createMarker(ii));
            this.orginLatlngMap.set(id, [longitude, latitude]);
          }
        }
      });
    });
    this.data = data;

    // yun
    const styles = item => {
      let id = this.getId(item);
      if (id && !Number.isFinite(id)) {
        id = id.split('_')[0];
      }
      let theColor = 'blue';
      let bSelectedItem = false;
      if (id && (id + '').indexOf(this.selectedPreventId) > -1) {
        theColor = color;
        bSelectedItem = true;
      }
      return {
        color: theColor,
        weight: 1,
        opacity: bSelectedItem && bStartEdit && bShowSaveBtn ? 0 : 0.65,
        fillOpacity: bSelectedItem && bStartEdit && bShowSaveBtn ? 0 : 0.2,
      };
    };

    // [delData, data].map(cell => {
    data = data.filter(item => {
      if (item.type === 'FeatureCollection') {
        if (item.features.length === 0) return false;
      } else {
        if (!item.properties) return false;
      }
      return true;
    });

    delData = delData.filter(item => {
      if (item.type === 'FeatureCollection') {
        if (item.features.length === 0) return false;
      } else {
        if (!item.properties) return false;
      }
      return true;
    });
    // })});
    data = this.addDraggedLatlng(data, dragArgs, true);
    delData = this.addDraggedLatlng(delData, dragArgs);

    const { name } = this.selectedEditedPreventCircle || {};
    const hasName = name !== '' && name;
    return (
      <LayerGroup>
        {data.map((item, index) => (
          <GeoJSON
            key={'geojson_' + this.getId(item)}
            data={this.getData(item)}
            style={() => styles(item)}
            onEachFeature={this.onEachFeature}
            pointToLayer={this.pointToLayer}
            onAdd={this.onAdd}
            onClick={this.onClick}
            onHover={this.onHover}
            title={item.name}
            ref={this.getRef(item)}
          />
        ))}
        {delData.map((item, index) =>
          editable && ((bShowSaveBtn && bStartEdit) || item.name === '' || !item.name) ? (
            <GeoJSON
              key={'delgeojson_' + this.getId(item)}
              data={item}
              pointToLayer={this.pointToDeleteMarkerLayer}
              onClick={() => this.onDelete(item)}
            />
          ) : null,
        )}
        {editable && editArgs && bShowSaveBtn && selectedPreventId && hasName ? (
          <Marker
            position={dragArgs ? [editArgs[0], editArgs[1]] : editArgs}
            icon={!bStartEdit ? editDivIcon : saveDivIcon}
            onClick={this.onSave}
          />
        ) : null}
      </LayerGroup>
    );
  }
}

export default connect(
  ({ fight, deploy, map: { mapAction, selectedPreventId, bPpreventCircleEditable } }) => {
    const { href } = window.location;
    const controlCircleWithOrganization =
      href.indexOf('deploy') > -1
        ? deploy.controlCircleWithOrganization.map(cell => {
            // cell.preventions = cell.preventions.filter(
            //   ii => ii.id == 928 && ii.name !== '' && ii.name,
            // );
            return cell;
          })
        : fight.controlCircleWithOrganization.map(cell => {
            cell.preventions = cell.preventions.filter(ii => ii.name !== '' && ii.name);
            return cell;
          });
    const {
      basicDeployModalVisible,
      areaDeployModalVisible,
      isShowEditor,
      isControlTopicEdit,
      basicDeployForm,
      testForm,
    } = deploy;
    return {
      controlCircleWithOrganization,
      mapAction,
      basicDeployModalVisible,
      areaDeployModalVisible,
      isShowEditor,
      isControlTopicEdit,
      basicDeployForm,
      testForm,
      selectedPreventId,
      bPpreventCircleEditable,
    };
  },
)(PreventCircle);
