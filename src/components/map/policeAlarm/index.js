/* eslint-disable jsx-a11y/alt-text */
import React, { Component, createRef } from 'react';
import { Marker, Popup, Tooltip, LayerGroup, LayersControl } from 'react-leaflet';
import { connect } from 'dva';
import {
  alarm110Icon,
  alarmControlIcon,
  alarm110DHighLightIcon,
  alarmControlHighLightIcon,
} from '@/components/map/constant';
import { Button, message } from 'antd';
import styles from './index.less';
import router from 'umi/router';
const { Overlay } = LayersControl;

@connect()
class PoliceAlarm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPoliceAlarmId: null,
      markerChecked: false,
    };
    this.refList = new Map();
  }
  componentDidMount() {
    const { dispatch } = this.props;
    // 先获取警情model的数据
    dispatch({
      type: 'policeSentiment/getRealTimeList',
      payload: {
        alarmType: [1, 2],
      },
    });
    dispatch({
      type: 'map/getPoliceAlarmList',
    });
    dispatch({
      type: 'map/locationPoliceAlarm',
      payload: {
        locationPoliceAlarm: this.locationPoliceAlarm,
      },
    });
    dispatch({
      type: 'map/recoverAlarmPoliceState',
      payload: {
        recoverAlarmPoliceState: this.recoverAlarmPoliceState,
      },
    });
  }

  locationPoliceAlarm = item => {
    this.props.mapAction.getMap().closePopup();
    console.log(item);
    this.props
      .dispatch({
        type: 'map/setLayerChecked',
        payload: {
          policeAlarm: true,
        },
      })
      .then(() => {
        const { id, type, orderId } = item;
        const key = id + '_' + type + '_' + orderId;
        const mk = this.refList.get(key);
        this.setState({ selectedPoliceAlarmId: id });
        if (mk && mk.current) {
          const ele = mk.current.leafletElement;
          const { lat, lng } = ele.getLatLng();
          this.props.mapAction.setCenterFn(lat, lng);
          setTimeout(() => {
            ele.openPopup();
          }, 500);
        }
      });
  };

  getRef = item => {
    const { id, type, orderId } = item;
    const key = id + '_' + type + '_' + orderId;
    let r = this.refList.get(key);
    if (!r) {
      r = createRef();
      this.refList.set(key, r);
    }
    return r;
  };

  onClickHandler = e => {
    const { selectedPoliceAlarmId, markerChecked } = this.state;
    const { dispatch } = this.props;
    const data = e.target.options.data;
    const { id, type } = data;
    const bRender = !selectedPoliceAlarmId || id !== selectedPoliceAlarmId;
    this.setState({
      selectedPoliceAlarmId: bRender ? id : null,
      markerChecked: !markerChecked || (selectedPoliceAlarmId && id !== selectedPoliceAlarmId),
    });
    if (bRender) {
      this.openPopupById(data);
    }
    // 非警情路由则跳转路由, 清除135弹窗
    if (!window.location.pathname.includes('/fight/alarm')) {
      router.push('/fight/alarm');
      dispatch({
        type: 'fight/modal135ChangeFn',
        payload: {
          modal135Visible: false,
          subwayModalVisible: false,
          checkpointVisible: false,
        },
      });
    }
    // 110警情
    if (type === 1) {
      dispatch({
        type: 'policeSentiment/setPoliceAlarmPopupVisible',
        payload: {
          policePopupVisible: !markerChecked,
        },
      });
      // 获取当前警情对象
      dispatch({
        type: 'policeSentiment/setCurrentSelectedPoliceObj',
        payload: {
          id,
        },
      });
      // 设置是否警情详情列表中数据是否重新请求
      dispatch({
        type: 'policeSentiment/setPoliceDetailShouldUpdate',
        payload: {
          reCall: true,
        },
      });
    }
  };

  openPopupById = data => {
    setTimeout(() => {
      const { current } = this.getRef(data) || {};
      if (current) {
        current.leafletElement.openPopup();
      }
    }, 200);
  };

  onClickHandleCheck = () => {
    message.warning('功能待开发');
  };
  onClosePopup = () => {
    if (this.state.markerChecked) {
      return;
    }
    this.recoverAlarmPoliceState();
  };
  getIcon = (id, type, selectedPoliceAlarmId) => {
    if (selectedPoliceAlarmId === id) {
      return type === 1 ? alarm110DHighLightIcon : alarmControlHighLightIcon;
    } else {
      return type === 1 ? alarm110Icon : alarmControlIcon;
    }
  };
  recoverAlarmPoliceState = () => {
    this.setState({ selectedPoliceAlarmId: null, markerChecked: false });
  };

  render() {
    window.g_policeAlarm = this;
    const { selectedPoliceAlarmId } = this.state;
    const { policeAlarmList } = this.props;
    const { isValidLatLngFn } = this.props.mapAction;
    const policeTmp = policeAlarmList.filter(item =>
      isValidLatLngFn({
        lat: item.latitude,
        lng: item.longitude,
      }),
    );
    policeTmp.map(item => {
      const { id, type, orderId, longitude, latitude } = item;
      item.position = [latitude, longitude];
      item.key =
        selectedPoliceAlarmId === id
          ? `${id}_${type}_${orderId}_selected`
          : `${id}_${type}_${orderId}`;
      item.icon = this.getIcon(id, type, selectedPoliceAlarmId);
      item.title = item.addr + ' ' + item.caseTime;
    });
    return (
      <LayerGroup>
        {policeTmp.map(item => (
          <Marker
            key={item.key}
            position={item.position}
            icon={item.icon}
            title={item.title}
            ref={this.getRef(item)}
            onClick={this.onClickHandler}
            data={item}
          >
            <Popup
              className={item.type === 2 ? styles.container : styles.containers}
              onClose={this.onClosePopup}
              closeButton={false}
            >
              <div className={styles.content}>
                <a className={styles.closeBtn} onClick={this.recoverAlarmPoliceState}>
                  x
                </a>
                <div className={styles.time}>{item.caseTime}</div>
                <div className={styles.name}>
                  <span title={item.targetName}>
                    {item.targetName && item.targetName.length > 6
                      ? item.targetName.slice(0, 6) + '...'
                      : item.targetName}
                  </span>
                  /
                  <span title={item.targetSource}>
                    {item.targetSource && item.targetSource.length > 12
                      ? item.targetSource.slice(0, 12) + '...'
                      : item.targetSource}
                  </span>
                </div>
                <div className={styles.db}>
                  <div className={styles.first}>
                    <div className={styles.img_box}>
                      <img
                        className={item.faceSearchPic ? null : styles.noneImg}
                        src={item.faceSearchPic || require(`@/assets/images/nonexistent.png`)}
                      />
                    </div>
                    <span>抓拍图</span>
                  </div>
                  <div className={styles.first}>
                    <div>相似度</div>
                    <span>{item.similarity * 100}%</span>
                  </div>
                  <div className={styles.first}>
                    <div className={styles.img_box}>
                      <img
                        className={item.pic ? null : styles.noneImg}
                        src={
                          item.pic
                            ? 'data:image/jpg;base64,' + item.pic
                            : require(`@/assets/images/nonexistent.png`)
                        }
                      />
                    </div>
                    <span>布控库</span>
                  </div>
                </div>
                <div className={styles.adds} title={item.addr}>
                  <img src={require(`@/assets/images/monitor-active.png`)} alt="" />
                  {item.addr}
                </div>
                <Button className={styles.bon} onClick={this.onClickHandleCheck}>
                  查看更多
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </LayerGroup>
    );
  }
}

export default connect(({ map, deploy }) => {
  return {
    policeAlarmList: map.policeAlarmList,
    mapAction: map.mapAction,
  };
})(PoliceAlarm);
