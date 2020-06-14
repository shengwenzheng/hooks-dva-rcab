import React from 'react';
import styles from './index.less';
import PoliceFace from './components/policeFace/index.jsx';
import PoliceAlarm from './components/policeAlarm/index.jsx';
import PoliceAlarmDetail from './components/policeAlarm/detail.jsx';
// import PoliceFaceDetail from './components/policeFace/detail.jsx';

import Modaldet from '../otf/components/Modaldet';
import Subway from '../otf/components/Subway';
import CheckPoint from '../otf/components/CheckPoint';

import Camera from './components/policeAlarm/camera/index.jsx';

// import Map from '@/components/map/war';
import { connect } from 'dva';
import { Radio, Icon, Checkbox, message } from 'antd';
const options = [
  { label: '110警情', value: 1 },
  { label: '人脸布控警情', value: 2 },
];
class PoliceSentiment extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indeterminate: false,
      checkAll: true,
      checkedList: [1, 2],
      alarmValue: 'realTime',
    };
  }
  componentDidMount() {
    this.props.dispatch({
        type: 'map/setLayerChecked',
        payload: {
          policeAlarm: true,
        },
      });
    this.props.dispatch({
      type: 'policeSentiment/getDataCount',
      payload: {},
    });
    this.props.dispatch({
      type: 'policeSentiment/openPolicePopup',
      payload: {
        openPolicePopup: this.openPolicePopup,
      },
    });
    this.getData();
  }
  getData = () => {
    this.props.dispatch({
      type: 'policeSentiment/getRealTimeList',
      payload: {
        alarmType: this.state.checkedList,
      },
    });
  };
  handleSizeChange = e => {
    e &&
    this.setState({
      alarmValue: e.target.value,
      checkedList: [1, 2],
      checkAll: true,
      indeterminate: false,
    });
  };
  onCheckAllChange = e => {
    this.setState(
      {
        checkedList: e.target.checked ? [1, 2] : [],
        checkAll: e.target.checked,
        indeterminate: false,
      },
      () => {
        this.getData();
      },
    );
  };
  onChange = list => {
    this.setState(
      {
        checkedList: list,
        checkAll: list.length === options.length,
        indeterminate: !!list.length && list.length < options.length,
      },
      () => {
        this.getData();
      },
    );
  };
  openPolicePopup = ({ show = true, id, reCall = true }) => {
    this.props.dispatch({
      type: 'policeSentiment/setPoliceAlarmPopupVisible',
      payload: {
        policePopupVisible: show,
      },
    });
    if (!show) {
      return;
    }
    // 设置当前警情对象
    this.props.dispatch({
      type: 'policeSentiment/setCurrentSelectedPoliceObj',
      payload: {
        id,
      },
    }).then(() => {
      this.props.locationPoliceAlarm(this.props.currentPoliceObj)
    })
    // 设置是否警情详情列表中数据是否重新请求
    this.props.dispatch({
      type: 'policeSentiment/setPoliceDetailShouldUpdate',
      payload: {
        reCall,
      },
    });
  };
  onUnableClick = () => {
    message.warning('功能待开发');
  };
  render() {
    const { alarmTotalNum, alarmUnHandleNum, alarmHandlingNum } = this.props.dataCount;
    const {
      realTimeList,
      currentPoliceObj,
      policePopupVisible,
      modal135Visible,
      subwayModalVisible,
      checkpointVisible,
      dispatch,
    } = this.props;
    const { alarmValue, indeterminate, checkAll, checkedList } = this.state;
    return (
      <div className={styles.opliceContainer}>
        {/* <Map /> */}
        <div className={styles.list}>
          <div className={styles.search}>
            <div>
              <img
                style={{ width: 14, height: 14 }}
                src={require(`@/assets/images/square.png`)}
                alt=""
              />
              <span>警情</span>
            </div>
          </div>
          <div className={styles.Top_Center}>
            <Radio.Group value={alarmValue} onChange={() => this.handleSizeChange()}>
              <Radio.Button
                style={{ width: '50%', height: '40px', textAlign: 'center', lineHeight: '40px' }}
                value="realTime"
              >
                实时警情/<span className={styles.numSpan}>{alarmTotalNum || 0}</span>
              </Radio.Button>
              <Radio.Button
                onClick={this.onUnableClick}
                style={{ width: '50%', height: '40px', textAlign: 'center', lineHeight: '40px' }}
                value="major"
              >
                重大警情/<span className={styles.numSpan}>{0}</span>
              </Radio.Button>
            </Radio.Group>
          </div>
          <div className={styles.WarningData}>
            <div>
              <p>警情数</p>
              <p>{alarmTotalNum || 0}</p>
            </div>
            <div>
              <p>未处理</p>
              <p>{alarmUnHandleNum || 0}</p>
            </div>
            <div>
              <p>处理中</p>
              <p>{alarmHandlingNum || 0}</p>
            </div>
          </div>
          <div className={styles.screen}>
            <Checkbox
              indeterminate={indeterminate}
              onChange={this.onCheckAllChange}
              checked={checkAll}
            >
              全部
            </Checkbox>
            <Checkbox.Group options={options} value={checkedList} onChange={this.onChange} />
          </div>
          <div>
            {realTimeList.length > 0 &&
            realTimeList.map(item => {
              if (item.type === 2) {
                return (
                  <PoliceFace
                    openPolicePopup={this.openPolicePopup}
                    realTimeList={realTimeList}
                    dispatch={dispatch}
                    params={item}
                    key={item.id}
                  />
                );
              } else {
                return <PoliceAlarm dispatch={dispatch} params={item} key={item.id} />;
              }
            })}
          </div>
        </div>

        {currentPoliceObj && currentPoliceObj.type === 1 && policePopupVisible && (
          <div className={styles.policedetailOutBox}>
            <PoliceAlarmDetail dispatch={dispatch} />
          </div>
        )}
        <div className={styles.modalOutBox}>
          {modal135Visible && <Modaldet />}
          {subwayModalVisible && <Subway />}
          {checkpointVisible && <CheckPoint />}
        </div>

        <div className={styles.cameraListContainer}>
          {/* 暂时关闭多选 */}
          {/* <Camera /> */}
        </div>
      </div>
    );
  }
}

export default connect(
  ({
     policeSentiment: { currentPoliceObj, dataCount, realTimeList, policePopupVisible, reCall },
     map,
     fight: { modal135Visible, subwayModalVisible, checkpointVisible },
   }) => {
    return {
      reCall,
      dataCount,
      realTimeList,
      currentPoliceObj,
      policePopupVisible,
      locationPoliceAlarm: map.locationPoliceAlarm,
      modal135Visible,
      subwayModalVisible,
      checkpointVisible,
    };
  },
)(PoliceSentiment);
