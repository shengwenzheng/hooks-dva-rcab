import React, { Component, createRef } from 'react';
import { Marker } from 'react-leaflet';
import {
  alarmIcon,
  alarmLocationIcon,
  alarmMenIcon,
  alarmCarIcon,
} from '@/components/map/constant';
import { Modal } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import copy from 'copy-to-clipboard';
import { message, Button } from 'antd';
import hull from '../utils/hull/hull';
import CircleSelect from '@/components/map/select/circle';
import { drawTempMarkersWithGraphic } from '@/components/map/listmarker/fastcluster.js';

const { L } = window;

class Alarm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibleTab: true,
      visible: false, // 报警详情框是否可见
      id: null, // 报警详情框数据ID
      conResData: {},
    };
    this.markerGroup = []; // 存放点位ref
    this.set = new Set();
    this.locationMarkerList = []; // 存储从前端定位过来的点
    this.polygonLayer = null; // 布控区域
    this.color = '#2950B8FF';
    this.style = {
      color: 'white',
      fillColor: this.color,
      fillOpacity: 0.2,
      opacity: 0,
      weight: 1,
    };
  }

  componentWillMount() {
    //通过pros接收父组件传来的方法
    this.props.onRef(this);
  }

  /**
   * 组件销毁
   */
  componentWillUnmount() {
    this.clear();
    if (this.map) {
      this.polygonLayer && this.map.removeLayer(this.polygonLayer);
      this.drawInterval && clearInterval(this.drawInterval);
    }
  }

  /**
   *
   */
  clear = () => {
    if (this.map) {
      this.locationMarker && this.map.removeLayer(this.locationMarker);
      this.circleMarker && this.map.removeLayer(this.circleMarker);
      this.locationMarkerList.map(item => this.map.removeLayer(item));
    }
  };

  /**
   * 查看报警详情
   * @param e
   */
  viewModel = e => {
    const { id } = e.target.options.data;
    this.setState({
      visible: true,
      id,
    });
    this.props.dispatch({
      type: 'control/conTrackingDetail',
      payload: {
        id,
      },
    });
  };
  /**
   * 结果卡片详情取消
   */
  handleCancel = e => {
    this.setState({
      visible: false,
    });
    Modal.destroyAll();
  };
  /**
   * 报警点定位
   * @param e
   */
  showAlarmPoint = (e, map) => {
    const id = e.id;
    const position = L.latLng(e.latitude, e.longitude);
    if (this.locationMarker) {
      const { alarmType1 } = this.locationMarker.options.data;
      this.locationMarker.setIcon(this.getIconByType(alarmType1));
      //   this.props.dispatch({
      //     type: 'control/conTrackingDetail',
      //     payload: {
      //       id,
      //     },
      //   });
    }
    this.circleMarker && map.removeLayer(this.circleMarker);

    const ref = this.markerGroup[id];
    if (ref && ref.current.leafletElement) {
      // this.locationMarker = ref.current.leafletElement.setIcon(alarmLocationIcon);
    } else {
      this.locationMarker = L.marker(position, { icon: this.getIconByType(), data: e })
        .on('click', this.viewModel)
        .addTo(map);
      this.locationMarkerList.push(this.locationMarker);
    }
    this.circleMarker = L.marker(position, { icon: alarmLocationIcon, data: e })
      .on('click', this.viewModel)
      .addTo(map);
    this.map = map;
  };
  /**
   * 绘制布控报警区域/地图反选
   * @param dataList 数据
   * @param map 地图对象
   * @param {boolean} isFlash 是否闪烁
   */
  drawHull = (dataList, map, isFlash) => {
    if (this.polygonLayer && map) {
      map.removeLayer(this.polygonLayer);
      this.drawInterval && clearInterval(this.drawInterval);
    }

    if (typeof dataList === 'string' && dataList !== '') {
      dataList = JSON.parse(dataList);
    }

    if (Array.isArray(dataList) && dataList.length > 1) {
      const points = [];
      dataList.forEach(data => {
        if (isFinite(data.longitude) && isFinite(data.latitude)) {
          // points.push([Number(data.longitude), Number(data.latitude)]);
          points.push([Number(data.latitude), Number(data.longitude)]);
        }
      });
      // const rst = hull(points, 20);
      // const copy = JSON.parse(JSON.stringify(rst));
      // copy.map(item => (item = item.reverse()));
      this.polygonLayer = L.polygon(points, this.style);
      map.addLayer(this.polygonLayer);
      map.fitBounds(this.polygonLayer.getBounds());
      drawTempMarkersWithGraphic('polygon', points, true);
    } else if (dataList && typeof dataList === 'object') {
      let { radius, pointBean } = dataList;
      if (radius && pointBean) {
        const center = [pointBean.latitude, pointBean.longitude];
        this.polygonLayer = L.circle(center, {
          radius: CircleSelect.degree2meter(radius),
          ...this.style,
        });
        map.addLayer(this.polygonLayer);
        map.fitBounds(this.polygonLayer.getBounds());
        drawTempMarkersWithGraphic('circle', { lnglat: center, radius }, true);
      }
    } else {
      drawTempMarkersWithGraphic('clear');
    }

    if (isFlash && this.polygonLayer) {
      let t = 0;
      const colors = ['#DF4570FF', this.color];
      this.drawInterval = setInterval(() => {
        const _i = t++ % 2;
        const color = colors[_i];
        const border = _i === 0 ? { color, opacity: 1 } : {};
        this.polygonLayer.setStyle({ ...this.style, fillColor: color, ...border });
      }, 1000);
    }
  };

  getIconByType(alarmType1_) {
    return alarmType1_ === 1 || alarmType1_ === 3
      ? alarmMenIcon
      : alarmType1_ === 2 || alarmType1_ === 4
      ? alarmCarIcon
      : alarmIcon;
  }

  // 跳转
  toJump = (e, alarmIdCard_) => {
    e.stopPropagation();
    if (copy(alarmIdCard_)) {
      message.destroy();
      message.info('身份证号已复制到剪切板');
    } else {
      message.destroy();
      message.warn('身份证号复制失败');
    }
    setTimeout(() => {
      window.open(
        'http://ztry-zyk.zx.ga/zhyy_zt//pages/xzztry/xzztry.jsp?desktopAppId=1846&biz=zt&ly=ztyw',
      );
    }, 1000);
  };

  // 对接一人一档
  toDocking = (e, alarmIdCard_) => {
    e.stopPropagation();
    if (alarmIdCard_) {
      window.open(
        'https://jwzs.hzos.hzs.zj/archives/person/overview?zjhm=' + alarmIdCard_ + '&zjlxdm=111',
      );
    }
  };

  render() {
    let { data } = this.props;
    const { visible, visibleTab, id } = this.state;
    let all = {};
    data.map(item => {
      item.position = L.latLng(item.latitude, item.longitude);
      this.markerGroup[item.id] = this.markerGroup[item.id] || createRef();
      if (item.id === id) all = item;
    });

    return (
      <div>
        {data.map((item, index) => (
          <Marker
            key={'alarm-' + Math.random()}
            position={item.position}
            icon={this.getIconByType(item.alarmType1)}
            data={item}
            zIndexOffset={500}
            onclick={this.viewModel}
            ref={this.markerGroup[item.id]}
          />
        ))}
      </div>
    );
  }
}

export default connect(({ control }) => {
  return {
    control,
    conResData: control.conResData,
  };
})(Alarm);
