import React, { Component, createRef } from 'react';
import { Marker, Popup, Tooltip, LayerGroup, LayersControl } from 'react-leaflet';
import { Badge, Button, message } from 'antd';
import { connect } from 'dva';
import { policeIcon, policeSelectedIcon } from '@/components/map/constant';
import styles from './index.less';

@connect()
class Police extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedPoliceId: null,
    };
    this.refList = new Map();
    this.policeTmp = [];
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'map/getPoliceList',
    });
    dispatch({
      type: 'map/locationPolice',
      payload: {
        locationPolice: this.locationPolice,
      },
    });
    dispatch({
      type: 'map/recoverPoliceState',
      payload: {
        recoverPoliceState: this.recoverPoliceState,
      },
    });
  }

  getRef = item => {
    const key = this.getId(item);
    let r = this.refList.get(key);
    if (!r) {
      r = createRef();
      this.refList.set(key, r);
    }
    return r;
  };

  locationPolice = item => {
    this.props.dispatch({
      type: 'map/setLayerChecked',
      payload: {
        police: true,
      },
    });
    this.setState({ selectedPoliceId: item.id });
    setTimeout(() => {
      const key = this.getId(item);
      const mk = this.refList.get(key);
      this.clearMarkerIcon();
      if (mk && mk.current) {
        const ele = mk.current.leafletElement;
        ele.openPopup();
        const { lat, lng } = ele.getLatLng();
        this.props.mapAction.setCenterFn(lat, lng);
      }
    }, 200);
  };

  getId(item) {
    const { gpsid, gpsName } = item;
    return gpsid + '_' + gpsName;
  }
  clearMarkerIcon() {
    this.refList.forEach((value, key) => {
      value.current.leafletElement.setIcon(policeIcon);
    });
  }
  onUnableClick() {
    message.warning('功能待开发');
  }
  onClick = e => {
    const { selectedPoliceId } = this.state;
    const { id } = e.target.options.data;
    this.setState({
      selectedPoliceId: selectedPoliceId === id ? null : id,
    });
    // 修改地图中的policelist状态
    // let newPoliceTmp = this.policeTmp.map(d => {
    //   d.active = d.key === item.key;
    //   return d;
    // });
    // TODO 点击地图后警情警员列表联动
    // 修改警情详情页的policelist状态
    // let newData = this.props.policeList;
    // newData.police = newPoliceTmp;
    // this.props.dispatch({
    //     type: 'policeSentiment/setPoliceList',
    //     payload: {
    //         newData
    //     }
    // })
  };
  getIcon = (id, selectedPoliceId) => {
    return selectedPoliceId === id ? policeSelectedIcon : policeIcon;
  };
  recoverPoliceState = () => {
    this.setState({ selectedPoliceId: null });
  };
  popupOnClose = () => {
    this.recoverPoliceState();
  };
  ellipsisStr = (value, sliceNum) => {
    if (!value) return;
    let str = value + '';
    return str.length > sliceNum ? str.slice(0, sliceNum) + '...' : str;
  };

  render() {
    const { selectedPoliceId } = this.state;
    const { police = [] } = this.props.policeList;
    const { isValidLatLngFn } = this.props.mapAction;
    this.policeTmp = police.filter(item =>
      isValidLatLngFn({
        lat: item.latitude,
        lng: item.longitude,
      }),
    );
    this.policeTmp.map(item => {
      item.position = [item.latitude, item.longitude];
      item.key = this.getId(item);
      item.id = item.gpsid;
    });
    return (
      <LayerGroup>
        {this.policeTmp.map(item => (
          <Marker
            key={item.key}
            position={item.position}
            icon={this.getIcon(item.id, selectedPoliceId)}
            title={item.gpsName}
            ref={this.getRef(item)}
            onClick={this.onClick}
            data={item}
          >
            <Popup className={styles.container} onClose={this.popupOnClose}>
              <div className={styles.content}>
                <div className={styles.pic}>
                  <img
                    src={item.policeImg || require(`@/assets/images/police-active.png`)}
                    alt=""
                  />
                </div>
                <div className={styles.baseInfo}>
                  <div className={styles.name}>{item.gpsName + '/状态'}</div>
                  <div>
                    <Badge
                      count={'民警'}
                      style={{
                        backgroundColor: 'rgb(48,83,178)',
                        color: '#fff',
                        borderRadius: 0,
                        marginRight: '12px',
                      }}
                    />
                    <span className={styles.dept}>{item.policeDept || 'XX部门'}</span>
                  </div>
                  <div>{'电话：' + item.policePhone}</div>
                  <div className={styles.phone}>
                    <span>{'短号：' + (item.policeShortPhone || 123123)}</span>
                    <span>{'电台：' + this.ellipsisStr(item.interphoneno, 6)}</span>
                  </div>
                </div>
                <div className={styles.pdt}>
                  <img src={require(`@/assets/images/interphone.png`)} alt="" />
                  <span>
                    对讲机-PDT 编号:
                    {this.ellipsisStr(item.gpsid, 11) || '0000000000'}
                  </span>
                  <img
                    className={styles.exchangeImg}
                    src={require(`@/assets/images/exchange.png`)}
                    alt=""
                  />
                  <span className={styles.exchange} onClick={this.onUnableClick}>
                    更换绑定对象
                  </span>
                </div>
                <div className={styles.submitPolice}>
                  <Button onClick={this.onUnableClick}>历史记录</Button>
                  <Button onClick={this.onUnableClick}>发钉钉</Button>
                  <Button onClick={this.onUnableClick}>语音呼叫</Button>
                  <Button onClick={this.onUnableClick}>发短信</Button>
                </div>
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
    policeList: map.policeList,
    mapAction: map.mapAction,
  };
})(Police);
