/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from 'react';
import styles from './index.less';
import { connect } from 'dva';
import { Modal } from 'antd';
import tuceng from '@/assets/mapicon/图层.png';
import huizhi from '@/assets/mapicon/绘制.png';
import onePng from '@/assets/mapicon/1分钟.png';
import twoPng from '@/assets/mapicon/3分钟.png';
import threePng from '@/assets/mapicon/5分钟.png';
import tollGate from '@/assets/mapicon/检查站.png';
import Sentrybox from '@/assets/mapicon/岗亭.png';
import entryAndexit from '@/assets/mapicon/出入口.png';
import mapOne from '@/assets/mapicon/one.png';
import mapTwo from '@/assets/mapicon/two.png';
import mapThree from '@/assets/mapicon/three.png';
// import { showLayer } from '../listmarker/fastcluster';

// const { confirm } = Modal;

class DrawPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: false,
      selectedItem: -1,
    };
    this.layerVisibilityClickNum = 0;
  }
  showLayerHidden = () => {
    const ele = document.getElementsByClassName('leaflet-control-layers')[0];
    const opacity = this.layerVisibilityClickNum % 2 === 0 ? 1 : 0;
    ele.style.opacity = opacity;
    ele.style.marginTop = '45px';
    ele.style.marginRight = '145px';
    this.layerVisibilityClickNum++;
    this.setState({
      flag: !this.state.flag,
    });
  };

  /**
   * 天假防控圈
   * //苏泽写的,别删
   * @param category 1分钟 3分钟 5分钟： 1 3 5
   */
  addDisposalCircle = category => {
    const { mapAction } = this.props;
    const { drawRouteMarkerFn } = mapAction;
    drawRouteMarkerFn(0, category);
    this.setState({ selectedItem: category });
  };

  seeWholeMap = () => {
    const { fitBounds } = this.props.mapAction;
    fitBounds([
      [29.8752056, 119.522211879],
      [30.5270584, 120.695400226],
    ]);
  };

  drawRouteMarker = (type, index) => {
    const { drawRouteMarkerFn } = this.props.mapAction;
    drawRouteMarkerFn(type);
    this.setState({ selectedItem: index });
  };

  render() {
    const { flag, selectedItem } = this.state;
    const { mapAction } = this.props;
    const { drawRouteMarkerFn, CircleSelectFn, PolygonSelectFn } = mapAction;

    return (
      <div>
        <div onClick={this.showLayerHidden} className={styles.layer}>
          图层显隐
          <span>
            <img src={tuceng} />
          </span>
        </div>
        {/*{flag === true ? <div className={styles.select}>内容暂无设计</div> : null}*/}
        <div className={styles.drawPanel}>
          <div className={styles.title}>
            图层绘制
            <span>
              <img src={huizhi} />
            </span>
          </div>
          <div className={styles.content}>
            <span className={styles.level2Title}>新建快反圈</span>
            <p
              onClick={() => this.addDisposalCircle(1)}
              className={selectedItem === 1 ? styles.selected : ''}
            >
              <span>1分钟处置圈</span>
              <img src={onePng} />
            </p>
            <p
              onClick={() => this.addDisposalCircle(3)}
              className={selectedItem === 3 ? styles.selected : ''}
            >
              <span>3分钟控制圈</span>
              <img src={twoPng} />
            </p>
            <p
              onClick={() => this.addDisposalCircle(5)}
              className={selectedItem === 5 ? styles.selected : ''}
            >
              <span>5分钟控制圈</span>
              <img src={threePng} />
            </p>
          </div>
          <div className={styles.content}>
            <span className={styles.level2Title}>新建环城圈</span>
            <div
              className={selectedItem === 7 ? styles.selected : ''}
              onClick={() => this.drawRouteMarker(3, 7)}
            >
              <span>检查站</span>
              <img src={tollGate} />
            </div>
            <div
              className={selectedItem === 9 ? styles.selected : ''}
              onClick={() => this.drawRouteMarker(2, 9)}
            >
              <span>岗亭</span>
              <img src={Sentrybox} />
            </div>
            <div
              className={selectedItem === 11 ? styles.selected : ''}
              onClick={() => this.drawRouteMarker(1, 11)}
            >
              <span>出入口</span>
              <img src={entryAndexit} />
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <img src={mapOne} onClick={this.seeWholeMap} />
          <img src={mapTwo} onClick={() => this.props.mapAction.zoomIn()} />
          <img src={mapThree} onClick={() => this.props.mapAction.zoomOut()} />
        </div>
      </div>
    );
  }
}
export default connect(({ map, deploy: { basicDeployModalVisible, areaDeployModalVisible } }) => {
  return {
    mapAction: map.mapAction,
    basicDeployModalVisible,
    areaDeployModalVisible,
  };
})(DrawPanel);
