import React, { Component } from 'react';
import { connect } from 'dva';
import {Modal,Icon } from 'antd';
import Tabs from '@/components/Tabs';
import peopleImg from '@/assets/images/people.png';
import peopleActiveImg from '@/assets/images/people-active.png';
import bookImg from '@/assets/images/book.png';
import bookActiveImg from '@/assets/images/book-active.png';
import videoImg from '@/assets/images/video.png';
import videoActiveImg from '@/assets/images/video-active.png';
import policeImg from '@/assets/images/police.png';
import policeActiveImg from '@/assets/images/police-active.png';
import { isJSON } from '@/utils/tool';
import { workingDayType as workingDayTypeList } from '@/utils/config';
import CameraBox from '../common/cameraBox';
import PoliceBox from '../common/policeBox';
import styles from './index.scss';

@connect(({ fight: { id,controlCircleWithOrganization },map: { recoverState} }) => ({ id,controlCircleWithOrganization, recoverState }))
class Modaldet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  controlBox = (data) => (
    <div className={styles.controlBox}>
      <div className={styles.header}>
        <span>已选择布控对象库: {data.length}</span>
      </div>
      <ul>
      {
        data.map(value => <li key={value.mc}>
          {value.mc}
        </li>)
      }
      </ul>
    </div>
  )

  showPlan = () => {
    this.setState({
      visible: true
    })
  }

  handleCancel = () => {
    this.setState({
      visible: false,
    });
  };

  modal135Cancel = () => {
    const {dispatch, recoverState} = this.props;
    dispatch({
      type: 'fight/modal135ChangeFn',
      payload: {
        show: false
      }
    });
    recoverState && recoverState();
  }

  render(){
    const {id,controlCircleWithOrganization} = this.props;
    let data = null;
    controlCircleWithOrganization.forEach(value => {
      value.preventions.forEach(val => {
        if(id == val.id){
          data = val;
        }
      })
    })
    if(!data){
      return <div/>
    }
    let controlData = [];
    const { workingDayType = [], startTime = [], endTime = [], crossDaySetting = [] } = isJSON(
      data.timePeriodJson,
    )
      ? JSON.parse(data.timePeriodJson)
      : {};
    if(data.circleSpznControlTask && data.circleSpznControlTask.ryztJson){
      controlData = JSON.parse(data.circleSpznControlTask.ryztJson);
    }
    return (
    <div className={styles.modal135}>
      <div className={styles.areaInfo}>
        <Icon type='close' className={styles.close} onClick={this.modal135Cancel}/>
        <div className={styles.areaName}>{data.name}</div>
        <div className={styles.areaDetail}>
          <span>{data.type}分钟处置圈</span>
          <div>
            <span>责任单位:</span>
            <span>{data.countyName}/{data.responsibleUnitName}</span>
          </div>
          <div>
            <span>重点时段:</span>
            <ul>
              {workingDayType.map((v, index) => (
                <li key={index}>{`${
                  workingDayTypeList.find(obj => Number(obj.key) === Number(v)).value
                } ${startTime[index]}-${crossDaySetting[index] ? '次日' : ''}${endTime[index]}`}</li>
              ))}
            </ul>
          </div>
          <div>
            <span>处置区域:</span>
            <span>{data.rapidDisposalArea}</span>
          </div>
        </div>
        <Tabs>
          <div title="布控对象" image={peopleImg} imageActive={peopleActiveImg} key="0">
            {this.controlBox(controlData)}
          </div>
          <div
            title="查看预案"
            image={bookImg}
            imageActive={bookActiveImg}
            key="1"
            onTabClick={this.showPlan}
          />
          <div title="警力" image={policeImg} imageActive={policeActiveImg} key="2">
            <PoliceBox/>
          </div>
          <div title="摄像监控" image={videoImg} imageActive={videoActiveImg} key="3">
            <CameraBox/>
          </div>
        </Tabs>

        <div className={styles.blockSty}>
          <Modal
          title="查看预案"
          width={646}
          visible={this.state.visible}
          footer={null}
          onCancel={this.handleCancel}
          >
            <div className={styles.preplan} dangerouslySetInnerHTML={{__html:data.preplan}}/>
          </Modal>
        </div>
      </div>
    </div>
    );
  }
}

export default Modaldet;
