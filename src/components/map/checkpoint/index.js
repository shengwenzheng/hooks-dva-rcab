import React, { Component, createRef } from 'react';
import { Marker, Popup, Tooltip, LayerGroup, LayersControl } from 'react-leaflet';
import { connect } from 'dva';
import {
  policeBoxIcon,
  passwayIcon,
  tollStationIcon,
  disablePasswayIcon,
  disablePoliceBoxIcon,
  disableTollStationIcon,
  passwaySelectedIcon,
  policeSelectedBoxIcon,
  tollStationSelectedIcon,
  editCheckPointDivIcon,
  deleterMarkerIcon,
} from '@/components/map/constant';
import styles from './index.less';
import { delPassway, delPolicebox, delTollStation } from '@/services/config';
import { message, Modal } from 'antd';
const { Overlay } = LayersControl;
const { confirm } = Modal;

@connect()
class CheckPoint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      p: {},
      map: new Map(),
      selectedId: null,
      selectedType: null,
      draggable: false,
      dragging: false,
      allowDragId: null,
      editBtnPosition: null,
      bShowEditBtn: false,
      deleteBtnPosition: null,
      bShowDeleteBtn: false,
      edittingData: null,
    };
    this.refList = new Map();
    this.editBtnRef = createRef();
    this.deleteBtnRef = createRef();
    this.nameRef = createRef();
    this.lonRef = createRef();
    this.latRef = createRef();
    this.highLightIcons = [passwaySelectedIcon, policeSelectedBoxIcon, tollStationSelectedIcon];
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'map/locationCheckPoint',
      payload: {
        locationCheckPoint: this.locationCheckPoint,
      },
    });
    this.props.dispatch({
      type: 'map/recoverCheckState',
      payload: {
        recoverCheckState: this.recoverState,
      },
    });
    this.bFight = window.location.href.indexOf('fight') > -1;
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.nameRef.current) {
      this.nameRef.current.focus();
    }
  }
  getIcon = (data, selectedId, selectedType) => {
    const { selectedCheckPointId } = this.props;
    const { type, id } = data;
    const hasName = data.name !== '' && data.name;
    let icon = null;
    const bHighLight = selectedId === id && selectedType === type && selectedCheckPointId;
    switch (type) {
      case 1:
        icon = bHighLight ? passwaySelectedIcon : hasName ? passwayIcon : disablePasswayIcon; // 出入口
        break;
      case 2:
        icon = bHighLight ? policeSelectedBoxIcon : hasName ? policeBoxIcon : disablePoliceBoxIcon; // 岗亭
        break;
      case 3:
        icon = bHighLight
          ? tollStationSelectedIcon
          : hasName
          ? tollStationIcon
          : disableTollStationIcon; // 检查站
        break;
    }
    return icon;
  };
  locationCheckPoint = item => {
    const { id, type } = item;
    const name = item.kakouName || item.title || item.name;
    const key = id + '_' + type;
    const mk = this.refList.get(key);
    if (mk && mk.current) {
      const ele = mk.current.leafletElement;
      const { lat, lng } = ele.getLatLng();
      this.props.mapAction.setCenterFn(lat, lng, 16);
      ele.fireEvent('click');
      // this.props
      //   .dispatch({
      //     type: 'map/setSelectedCheckPointId',
      //     payload: {
      //       selectedCheckPointId: id,
      //     },
      //   })
      //   .then(res => {
      //     this.setState({ selectedId: id, selectedType: type });
      //     setTimeout(() => {
      //       const newMk = this.refList.get(key);
      //       if (newMk && newMk.current) {
      //         newMk.current.leafletElement.openPopup();
      //       }
      //     }, 200);
      //   });
    }
  };
  getRef = (item, isDeleteMarker) => {
    const { id, type } = item;
    const key = !isDeleteMarker ? id + '_' + type : id + '_' + type + '_delete';
    let r = this.refList.get(key);
    if (!r) {
      r = createRef();
      this.refList.set(key, r);
    }
    return r;
  };
  savePoi = data => {
    const { setCenterFn } = this.props.mapAction;
    const { type, id } = data;
    const name = this.nameRef.current.value;
    const oldPosition = data.position;
    const oldLat = oldPosition[0];
    const oldLon = oldPosition[1];
    const oldName = data.name;
    let lon = this.lonRef.current.value;
    let lat = this.latRef.current.value;
    lon = Number(lon);
    lat = Number(lat);
    const bModify = oldName === name && lon === oldLon && lat === oldLat;
    const tips = bModify ? '未修改' : '保存成功';
    const position = [lon, lat];
    const tmp = JSON.parse(JSON.stringify(data));
    const editBtnPosition = { lat, lon };
    const deleteBtnPosition = { lat, lon };
    delete tmp.position;
    delete tmp.name;
    if (name === '' || name === undefined) {
      message.warning('请输入名字');
    } else {
      if (type === 1) {
        this.props
          .dispatch({
            type: 'map/updatePassway',
            payload: {
              id,
              coordinate: position[1] + ',' + position[0],
              kakouName: name,
              title: name,
            },
          })
          .then(res => {
            if (res.code === 200) {
              message.info(tips);
              this.setState({
                allowDragId: null,
                bShowDeleteBtn: false,
                bShowEditBtn: true,
                editBtnPosition,
                deleteBtnPosition,
              });
              setCenterFn(lat, lon);
              // this.recoverState();
              this.props.dispatch({
                type: 'deploy/getDoorwayList',
              });
            } else if (res.code === 1001) {
              // message.warning(res.message);
            } else {
              message.error(res.message);
            }
          });
      } else if (type === 2) {
        this.props
          .dispatch({
            type: 'map/updatePolicebox',
            payload: {
              id,
              coordinate: position[1] + ',' + position[0],
              title: name,
            },
          })
          .then(res => {
            if (res.code === 200) {
              message.info(tips);
              this.setState({
                allowDragId: null,
                bShowDeleteBtn: false,
                bShowEditBtn: true,
                editBtnPosition,
                deleteBtnPosition,
              });
              setCenterFn(lat, lon);
              // this.recoverState();
              this.props.dispatch({
                type: 'deploy/getPoliceboxList',
              });
            } else if (res.code === 1001) {
              // message.warning(res.message);
            } else {
              message.error(res.message);
            }
          });
      } else if (type === 3) {
        this.props
          .dispatch({
            type: 'map/updateTollStation',
            payload: {
              id,
              coordinate: position[1] + ',' + position[0],
              title: name,
            },
          })
          .then(res => {
            if (res.code === 200) {
              message.info(tips);
              this.setState({
                allowDragId: null,
                bShowDeleteBtn: false,
                bShowEditBtn: true,
                editBtnPosition,
                deleteBtnPosition,
              });
              setCenterFn(lat, lon);
              // this.recoverState();
              this.props.dispatch({
                type: 'deploy/getCheckpointList',
              });
            } else if (res.code === 1001) {
              // message.warning(res.message);
            } else {
              message.error(res.message);
            }
          });
      }
    }
  };
  deletePoi = data => {
    if (!data) {
      return;
    }
    const { type, id, name } = data;
    const fn = type === 1 ? 'delPassway' : type === 2 ? 'delPolicebox' : 'delTollStation';
    const fnStr =
      type === 1 ? 'getDoorwayList' : type === 2 ? 'getPoliceboxList' : 'getCheckpointList';
    const typeStr = type === 1 ? '出入口' : type === 2 ? '岗亭' : '检查站';
    const title = `是否删除该${typeStr}，若删除，该${typeStr}的基础信息和实战模块已配置的其他信息（布控配置、警力配置）将被一并删除！`;
    if (name !== '' && name) {
      confirm({
        title,
        okText: '删除',
        cancelText: '取消',
        onOk: () => {
          this.startDelete({ fn, id, fnStr });
        },
      });
    } else {
      this.startDelete({ fn, id, fnStr });
    }
  };
  startDelete = ({ fn, id, fnStr }) => {
    this.props
      .dispatch({
        type: `map/${fn}`,
        payload: id,
      })
      .then(({ code }) => {
        if (code === 200) {
          message.info('删除成功');
          this.props.dispatch({
            type: `deploy/${fnStr}`,
          });
        } else {
          message.warn('删除失败！');
        }
      });
    this.state.bShowDeleteBtn = false;
    this.recoverState();
  };
  cancelPoi = data => {
    const { current } = this.getRef(data) || {};
    if (current) {
      const icon = this.getIcon(data);
      current.leafletElement.closePopup().setIcon(icon);
    }
  };
  lonOnChange = (e, item) => {
    const { id, name, position, type } = item;
    const key = type + '_' + id;
    position[1] = e.target.value.replace(/[^\d.]/g, '');
    item.position = position;
    const { map } = this.state;
    map.set(key, { ...item });
    this.setState({ map });
  };
  latOnChange = (e, item) => {
    const { id, name, position, type } = item;
    const key = type + '_' + id;
    position[0] = e.target.value.replace(/[^\d.]/g, '');
    item.position = position;
    const { map } = this.state;
    map.set(key, { ...item });
    this.setState({ map });
  };
  onkeyUps = e => {
    e.target.value = e.target.value.replace(/\s+/g, '');
  };
  nameOnChange = (e, item) => {
    const { id, name, type } = item;
    const key = type + '_' + id;
    const txtname = e.target.value;
    if (item.hasOwnProperty('kakouName')) {
      item.kakouName = txtname;
    }
    if (item.hasOwnProperty('title')) {
      item.title = txtname;
    }
    item.name = txtname;
    const { map } = this.state;
    map.set(key, { ...item });
    this.setState({ map });
    this.startEdit();
  };
  getDeployData = () => {
    this.props.dispatch({
      type: 'deploy/getDoorwayList',
    });
    this.props.dispatch({
      type: 'deploy/getPoliceboxList',
    });
    this.props.dispatch({
      type: 'deploy/getCheckpointList',
    });
  };
  closeVideoPopup = data => {
    if (!data) {
      return;
    }
    const { selectedId } = this.state;
    if (selectedId) {
      this.recoverState();
      !this.bFight && message.info('未修改');
    }
  };
  onClick = e => {
    const { id, type, name } = e.target.options.data;
    let { selectedId, selectedType, dragging } = this.state;
    const isAnotherClick = selectedId && selectedId !== id;
    if (!isAnotherClick) {
      if (this.state.bShowDeleteBtn) {
        this.setState({
          bShowDeleteBtn: false,
          bShowEditBtn: true,
        });
        return;
      }
      if (e.target.bDragging && selectedId === null) {
        return;
      }
      if (name !== '' && name && this.state.bShowDeleteBtn) {
        e.originalEvent.preventDefault();
        this.openPopupById({ id, type });
        return;
      }
    }

    const hasName = name !== '' && name;
    const bRender = !selectedId || id !== selectedId;
    const editBtnPosition = !hasName || bRender ? e.target.getLatLng() : null;
    const deleteBtnPosition = !hasName || bRender ? e.target.getLatLng() : null;
    const bShowEditBtn = hasName && bRender;
    const bShowDeleteBtn = !bShowEditBtn;
    const bSameMarkerDragging = e.target.bDragging && selectedId && id === selectedId;

    this.setState({
      selectedId: bRender ? id : null,
      selectedType: bRender ? type : null,
      draggable: bRender,
      editBtnPosition,
      bShowEditBtn,
      bShowDeleteBtn,
      deleteBtnPosition,
      edittingData: bRender ? e.target.options.data : null,
    });

    if (bRender) {
      // 1、设置当前选中的点位ID。2、打开冒泡窗口
      this.props.dispatch({
        type: 'map/setSelectedCheckPointId',
        payload: {
          selectedCheckPointId: id,
        },
      });
      this.openPopupById({ id, type });
      this.props.dispatch({
        type: 'fight/checkPointFn',
        payload: {
          data: e.target.options.data,
          show: true,
        },
      });
    } else {
      this.recoverState();
    }
  };
  openPopupById = ({ id, type }) => {
    const key = id + '_' + type;
    setTimeout(() => {
      const { current } = this.refList.get(key) || {};
      if (current) {
        current.leafletElement.openPopup();
      }
    }, 200);
  };
  onDelete = e => {};
  ondragend = e => {
    const { map } = this.state;
    e.target.bDragging = true;
    const latlng = e.target.getLatLng();
    const { data } = e.target.options;
    const { name, type, id } = data;
    const key = `${type}_${id}`;
    const value = map.get(key) || data;
    const { lat, lng } = e.target.getLatLng();
    const editBtnPosition = e.target.getLatLng();
    const deleteBtnPosition = editBtnPosition;
    value.position = [lat, lng];
    map.set(key, { ...value });
    if (name !== '' && name) {
      this.setState({
        map,
        editBtnPosition,
        deleteBtnPosition,
      });
    } else {
      this.setState({
        selectedId: id,
        selectedType: type,
        edittingData: data,
        map,
      });
      this.props.dispatch({
        type: 'map/setSelectedCheckPointId',
        payload: {
          selectedCheckPointId: -1,
        },
      });
    }
    this.openPopupById({ id, type });
  };
  startEdit = e => {
    const { selectedId, edittingData } = this.state;
    const { id, type } = edittingData;
    this.setState({ allowDragId: selectedId, bShowDeleteBtn: true, bShowEditBtn: false });
    this.openPopupById({ id, type });
  };
  getId = (item, selectedId, selectedType, selectedCheckPointId, map) => {
    const { position, name } = item;
    return selectedId && selectedCheckPointId
      ? `${item.type}_${item.id}_${position.join('_')}_${name}_${
          this.bFight
        }_${selectedId}_${selectedType}`
      : `${item.type}_${item.id}_${position.join('_')}_${name}_${this.bFight}`;
  };
  recoverState = (data, bTips = false) => {
    const { dispatch } = this.props;
    const { type, id } = data || {};
    if (data) {
      const key = `${type}_${id}`;
      this.state.map.delete(key);
      this.cancelPoi(data);
    }
    if (bTips || this.state.bShowDeleteBtn) {
      message.info('未修改');
      const key = type + '_' + id;
      this.state.map.delete(key);
    }
    this.setState({
      selectedId: null,
      selectedType: null,
      draggable: false,
      dragging: false,
      allowDragId: null,
      editBtnPosition: null,
      bShowEditBtn: false,
      deleteBtnPosition: null,
      bShowDeleteBtn: false,
      edittingData: null,
    });
    if (this.bFight) {
      dispatch({
        type: 'fight/subwayModalFn',
        payload: {
          show: false,
        },
      });
      dispatch({
        type: 'fight/checkPointFn',
        payload: {
          show: false,
        },
      });
      dispatch({
        type: 'map/setSelectedPreventId',
        payload: {
          selectedPreventId: null,
        },
      });
    }
  };
  render() {
    window.g_checkPoint = this;
    const {
      map,
      selectedId,
      selectedType,
      draggable,
      allowDragId,
      editBtnPosition,
      bShowEditBtn,
      deleteBtnPosition,
      bShowDeleteBtn,
      edittingData,
    } = this.state;
    const {
      checkPoint = {
        passway: [],
        policebox: [],
        tollStation: [],
      },
      mapAction,
      policeboxList,
      checkpointList,
      doorwayList,
      editable,
      selectedCheckPointId,
    } = this.props;
    doorwayList.map(item => (item.type = 1));
    policeboxList.map(item => (item.type = 2));
    checkpointList.map(item => (item.type = 3));
    const totalData = policeboxList.concat(checkpointList).concat(doorwayList);
    let data = [];
    totalData.forEach(item => {
      const { kakouName, title } = item;
      // 作战页不显示未配置的
      if (!this.bFight || (kakouName !== '' && kakouName) || (title !== '' && title)) {
        data.push({ ...item });
      }
    });
    for (var o in checkPoint) {
      data = data.concat(checkPoint[o]);
    }
    data = data.filter(item => item.coordinate && item.coordinate !== '');
    data.map(item => {
      let { coordinate, id, type } = item;
      let a = coordinate.split(',')[0];
      let b = coordinate.split(',')[1];
      a = Number(a);
      b = Number(b);
      const lat = a > b ? b : a;
      const lon = a > b ? a : b;
      item.position = [lat, lon];

      const key = type + '_' + id;
      const obj = map.get(key);
      if (obj) {
        item.positionN = [...obj.position].map(item => Number(item));
        item.position = obj.position;
        item.name = obj.kakouName || obj.title;
      } else {
        item.name = item.kakouName || item.title || '';
      }
    });

    return (
      <LayerGroup>
        {data.map(item => (
          <Marker
            key={this.getId(item, selectedId, selectedType, selectedCheckPointId, map)}
            position={item.positionN || item.position}
            icon={this.getIcon(item, selectedId, selectedType)}
            title={item.name}
            ref={this.getRef(item)}
            onClick={this.onClick}
            data={item}
            draggable={!item.name || allowDragId === item.id ? true : false}
            onDragend={this.ondragend}
          >
            {item.name !== '' && item.name ? (
              <Tooltip permanent={true} direction="top" offset={[0, -36]}>
                {item.name}
              </Tooltip>
            ) : null}
            <Popup
              key={`pop_${item.id}`}
              className={styles.container}
              onClose={() => this.closeVideoPopup()}
              closeButton={false}
            >
              {editable ? (
                allowDragId !== item.id && item.name !== '' ? (
                  <div>
                    <div className={styles.poiContent}>
                      <div>
                        <span className={styles.title}>{item.name}</span>
                      </div>
                      <a className={styles.closeBtn} onClick={this.recoverState}>
                        x
                      </a>
                      <div>
                        <span>经度：</span>
                        <span>{item.position[1]}</span>
                      </div>
                    </div>
                    <div>
                      <span>纬度：</span>
                      <span>{item.position[0]}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className={styles.poiContent}>
                      <div>
                        <span>经度：</span>
                        <input
                          ref={this.lonRef}
                          defaultValue={item.position[1]}
                          onChange={e => {}}
                          disabled={allowDragId !== item.id && item.name !== ''}
                        />
                      </div>
                      <div>
                        <span>纬度：</span>
                        <input
                          ref={this.latRef}
                          defaultValue={item.position[0]}
                          onChange={e => {}}
                          disabled={allowDragId !== item.id && item.name !== ''}
                        />
                      </div>
                      <div>
                        <span>名称：</span>
                        <input
                          ref={this.nameRef}
                          defaultValue={item.name}
                          maxLength="12"
                          onKeyUp={e => this.onkeyUps(e, item)}
                          onChange={e => {}}
                          disabled={allowDragId !== item.id && item.name !== ''}
                        />
                      </div>
                    </div>
                    <div
                      className={styles.footer}
                      style={{
                        display: allowDragId !== item.id && item.name !== '' ? 'none' : 'block',
                      }}
                    >
                      <button onClick={() => this.savePoi(item)} className={styles.save}>
                        保存
                      </button>
                      <button onClick={() => this.recoverState(item, true)} className={styles.del}>
                        取消
                      </button>
                    </div>
                  </div>
                )
              ) : item.name === '' ? (
                '暂无名称'
              ) : (
                <div className={styles.info}>
                  <div className={styles.title}>{item.name}</div>
                  <a className={styles.closeBtn} onClick={this.recoverState}>
                    x
                  </a>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
        {/*{data*/}
        {/*  .filter(item => item.name === '' || !item.name)*/}
        {/*  .map(item => (*/}
        {/*    <Marker*/}
        {/*      key={this.getId(item, selectedId, selectedType, selectedCheckPointId) + '_delete'}*/}
        {/*      position={item.positionN || item.position}*/}
        {/*      icon={deleterMarkerIcon}*/}
        {/*      ref={this.getRef(item, true)}*/}
        {/*      onClick={() => this.deletePoi(item)}*/}
        {/*      data={item}*/}
        {/*    />*/}
        {/*  ))}*/}
        {editable &&
        bShowEditBtn &&
        selectedCheckPointId &&
        selectedCheckPointId !== -1 &&
        editBtnPosition ? (
          <Marker
            position={editBtnPosition}
            icon={editCheckPointDivIcon}
            onClick={this.startEdit}
            ref={this.editBtnRef}
          />
        ) : null}
        {editable &&
        bShowDeleteBtn &&
        selectedCheckPointId &&
        selectedCheckPointId !== -1 &&
        deleteBtnPosition ? (
          <Marker
            position={deleteBtnPosition}
            icon={deleterMarkerIcon}
            onClick={() => this.deletePoi(edittingData)}
            ref={this.deleteBtnRef}
          />
        ) : null}
      </LayerGroup>
    );
  }
}

export default connect(({ map, deploy, fight }) => {
  return {
    checkPoint: map.checkPoint,
    mapAction: map.mapAction,
    delPolicebox: [],
    delPassway: [],
    delTollStation: [],
    savePoi: map.savePoi,
    checkpointList: deploy.checkpointList.length > 0 ? deploy.checkpointList : fight.checkpointList,
    policeboxList: deploy.policeboxList.length > 0 ? deploy.policeboxList : fight.policeboxList,
    doorwayList: deploy.doorwayList.length > 0 ? deploy.doorwayList : fight.doorwayList,
    selectedCheckPointId: map.selectedCheckPointId,
  };
})(CheckPoint);
