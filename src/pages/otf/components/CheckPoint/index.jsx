import React, { Component } from 'react';
import { connect } from 'dva';
import {Icon} from 'antd';
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
import PoliceSetBox from '../common/policeSetBox'
import styles from './index.scss';


@connect(({ fight: { checkpointDet }, map: { recoverCheckState} }) => ({ checkpointDet, recoverCheckState }))
class CheckPoint extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  checkPointCancel = () => {
    const {dispatch, recoverCheckState} = this.props;
    dispatch({
      type: 'fight/checkPointFn',
      payload: {
        show: false
      }
    });
    recoverCheckState && recoverCheckState();
  }

  render(){
    const {checkpointDet} = this.props;
    if(!checkpointDet){
      return <div/>
    }
    return (
    <div className={styles.modal135}>
      <div className={styles.areaInfo}>
        <Icon type='close' className={styles.close} onClick={this.checkPointCancel}/>
        <div className={styles.areaName}>{checkpointDet.title||checkpointDet.kakouName}</div>
        <div className={styles.areaDetail}>
          <span>环城圈/岗亭</span>
          {checkpointDet.person && <div>
            <span>负责人员:</span>
            <span>{checkpointDet.person}/{checkpointDet.phone}<br/>{checkpointDet.policeForceDeptName}</span>
          </div>}
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

export default CheckPoint;
