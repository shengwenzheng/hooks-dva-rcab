import React, { Component } from 'react';
import { connect } from 'dva';
import {Icon,message } from 'antd';
import Tabs from '@/components/Tabs';
import peopleImg from '@/assets/images/people.png';
import peopleActiveImg from '@/assets/images/people-active.png';
import videoImg from '@/assets/images/video.png';
import videoActiveImg from '@/assets/images/video-active.png';
import policeImg from '@/assets/images/police.png';
import policeActiveImg from '@/assets/images/police-active.png';
import managImg from '@/assets/images/manag.png';
import managActiveImg from '@/assets/images/manag-active.png';
import CameraBox from '../common/cameraBox';
import PoliceBox from '../common/policeBox';
import ControlBox from '../common/controlBox';
import PoliceSetBox from '../common/policeSetBox';
import styles from './index.scss';

@connect(({ fight: { subwayPolice }, map: {recoverSubwayState} }) => ({ subwayPolice, recoverSubwayState }))
class Subway extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  subwayCancel = () => {
    const {dispatch, recoverSubwayState} = this.props;
    dispatch({
      type: 'fight/subwayModalFn',
      payload: {
        show: false
      }
    });
    recoverSubwayState && recoverSubwayState();
  }

  render(){
    const {subwayPolice} = this.props;
    const subwayCount = (str) => {
      if(!str) return;
      let arr = [];
      arr = str.split(',');
      return arr;
    }
    if(!subwayPolice){
      return <div/>
    }
    return (
    <div className={styles.modal135}>
      <div className={styles.areaInfo}>
        <Icon type='close' className={styles.close} onClick={this.subwayCancel}/>
        <div className={styles.areaName}>{subwayPolice.subwayStationName}</div>
        <div className={styles.areaDetail}>
          {subwayCount(subwayPolice.subwayStationWay).map((value,key) => <span key={value} style={{background:key == 1 ?'#318E1F':''}}>地铁{value}号线</span>)}
          <div>
            <span>负责人员:</span>
            <span>{subwayPolice.principalName}/{subwayPolice.principalMobile}<br/>{subwayPolice.departmentName}</span>
          </div>
        </div>
        <Tabs>
          <div title="布控对象" image={peopleImg} imageActive={peopleActiveImg} key="0">
            <ControlBox/>
          </div>
          <div title="摄像监控" image={videoImg} imageActive={videoActiveImg} key="1">
            <CameraBox/>
          </div>
          <div title="警力" image={policeImg} imageActive={policeActiveImg} key="2">
            <PoliceBox/>
          </div>
          <div title="警力配置" image={managImg} imageActive={managActiveImg} key="3">
            <PoliceSetBox/>
          </div>
        </Tabs>
      </div>
    </div>
    );
  }
}

export default Subway;
