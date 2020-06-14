import React, { Component } from 'react';
import styles from './index.less';
import {
  layerFlag,
  layerSelectedFlag,
  circleSelectImg,
  circleSelectedImg,
  rectangleSelectedImg,
  rectangleSelectImg,
} from '@/components/map/constant';
import { connect } from 'dva';
import { showLayer, hideLayer } from '../listmarker/fastcluster';
import mapOne from '@/assets/mapicon/one.png';
import mapTwo from '@/assets/mapicon/two.png';
import mapThree from '@/assets/mapicon/three.png';

const { L } = window;
class Panel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      layerFlagImg: layerFlag,
      rectImg: rectangleSelectImg,
      circleImg: circleSelectImg,
      opacity: 0,
      checked: false,
      currentImg: null,
    };
    this.layerVisibilityClickNum = 0;
    this.bFirstClicked = true;
  }
  componentDidMount() {
    setTimeout(() => [0, 1, 2].forEach(i => hideLayer(i)), 1000);
  }
  layerVisibilityClicker = e => {
    const ele = document.getElementsByClassName('leaflet-control-layers')[0];
    const opacity = this.layerVisibilityClickNum % 2 === 0 ? 1 : 0;
    ele.style.opacity = opacity;
    ele.style.marginTop = '63px';
    this.layerVisibilityClickNum++;
    this.setState({ opacity });
    this.setState({ layerFlagImg: opacity ? layerSelectedFlag : layerFlag });
    this.setState({ rectImg: rectangleSelectImg });
    this.setState({ circleImg: circleSelectImg });
    this.setState({ currentImg: opacity ? 'layer' : null });
  };

  polygonSelect = e => {
    this.setState({ circleImg: circleSelectImg });
    this.setState({ rectImg: rectangleSelectedImg });
    this.setState({ layerFlagImg: layerFlag });
    this.setState({ currentImg: 'rect' });
    const { RectangleSelectFn } = this.props.mapAction;
    RectangleSelectFn({
      isClear: true,
      callback: this.rectangleSelectCallback,
    });
  };

  circleSelect = e => {
    this.setState({ currentImg: 'circle' });
    this.setState({ circleImg: circleSelectedImg });
    this.setState({ rectImg: rectangleSelectImg });
    this.setState({ layerFlagImg: layerFlag });
    const { CircleSelectFn } = this.props.mapAction;
    CircleSelectFn({
      isClear: true,
      callback: this.circleSelectCallback,
    });
  };

  circleSelectCallback = obj => {
    const { circle } = obj;
    this.props
      .dispatch({
        type: 'map/countBaseInfoByCircle',
        payload: obj,
      })
      .then(res => {
        circle.bindTooltip(this.getInfo(res), {
          permanent: true,
          direction: 'right',
        });
        this.setState({ circleImg: circleSelectImg });
        this.setState({ currentImg: null });
      });
  };

  rectangleSelectCallback = obj => {
    const { rectangle } = obj;
    this.props
      .dispatch({
        type: 'map/countBaseInfoByRectangle',
        payload: obj,
      })
      .then(res => {
        rectangle.bindTooltip(this.getInfo(res), {
          permanent: true,
          direction: 'right',
        });
        this.setState({ rectImg: rectangleSelectImg });
        this.setState({ currentImg: null });
      });
  };

  getInfo = res => {
    const {
      cameraTotal, //监控数量
      policeTotal, //警力数量
      alarmTotal, //警情数量
      zdryTotal, //重点人员数量
      qkryTotal, //前科人员数量
      faceTotal, //人脸卡口数量
      carTotal, //车辆卡口数量
    } = res;
    return `<div>监控数量:${cameraTotal}</div>
              <div>警力数量:${policeTotal}</div>
              <div>警情数量:${alarmTotal}</div>
              <div>重点人员数量:${zdryTotal}</div>
              <div>前科人员数量:${qkryTotal}</div>
              <div>人脸卡口数量:${faceTotal}</div>
              <div>车辆卡口数量:${carTotal}</div>
              `;
  };

  videoLayerClicker = e => {
    const { addVideoDeviceLayer } = this.props.mapAction;
    if (this.bFirstClicked) {
      addVideoDeviceLayer && addVideoDeviceLayer();
      this.bFirstClicked = false;
      this.setState({ checked: true });
      return;
    }
    const { checked } = this.state;
    const fn = !checked ? showLayer : hideLayer;
    [0, 1, 2].forEach(i => fn(i));
    this.setState({ checked: !checked });
  };

  seeWholeMap = () => {
    const { fitBounds } = this.props.mapAction;
    fitBounds([
      [29.8752056, 119.522211879],
      [30.5270584, 120.695400226],
    ]);
  };

  render() {
    const { rectImg, circleImg, opacity, checked, layerFlagImg, currentImg } = this.state;
    const { police = [] } = this.props.policeList;

    return (
      <div className={styles.container}>
        <div
          className={`${currentImg === 'layer' ? styles.checkedRectTip : styles.rectTip} ${
            styles.layerVisibility
          }`}
          onClick={this.layerVisibilityClicker}
        >
          图层显隐
          <span>
            <img src={layerFlagImg} />
          </span>
        </div>
        <div
          className={styles.videoLayer}
          style={{ opacity: opacity }}
          onClick={this.videoLayerClicker}
        >
          <input type="checkbox" checked={checked} onChange={() => {}} />
          <span>监控</span>
        </div>
        <div
          className={`${currentImg === 'rect' ? styles.checkedRectTip : styles.rectTip} ${
            styles.polygonSelect
          }`}
          onClick={this.polygonSelect}
        >
          框选
          <span>
            <img src={rectImg} />
          </span>
        </div>
        <div
          className={`${currentImg === 'circle' ? styles.checkedRectTip : styles.rectTip} ${
            styles.circleSelect
          }`}
          onClick={this.circleSelect}
        >
          圈选
          <span>
            <img src={circleImg} />
          </span>
        </div>
        <div className={styles.totalPoliceNum}>
          当前警力：<span>{police.length}</span>人
        </div>
        <div className={styles.zoom}>
          <img src={mapOne} onClick={this.seeWholeMap} />
          <img src={mapTwo} onClick={() => this.props.mapAction.zoomIn()} />
          <img src={mapThree} onClick={() => this.props.mapAction.zoomOut()} />
        </div>
      </div>
    );
  }
}

export default connect(({ map }) => {
  return {
    mapAction: map.mapAction,
    policeList: map.policeList,
  };
})(Panel);
