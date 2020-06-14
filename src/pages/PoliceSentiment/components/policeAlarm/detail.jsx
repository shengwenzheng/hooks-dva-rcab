import { useState, useEffect } from 'react';
import { Icon, Badge, Button, Radio, message } from 'antd';
import Step from './step';
import Stackedcolumn from './steps';
import Monitor from './monitor';
import PoliceForces from './policeForces';
import Record from './record';
import styles from './index.less';
import { connect } from 'dva';
let Message = message;

function PoliceAlarmDetail(props) {
  const {
    dispatch,
    policeSentiment: {
      reCall,
      currentPoliceObj:{
        addr,
        message,
        dealOrgName,
        caseTime,
        reportPhone,
        reportName,
        longitude,
        latitude,
      }
    },
    recoverAlarmPoliceState,
  } = props;
  const [num, setNum] = useState('1');
  function handleSizeChange(value) {
    // 暂不展示后面两个
    if (value === '3' || value === '4') return;
    setNum(value);
    if (value === '1') {
      dispatch({
        type: 'policeSentiment/getvideoList',
        payload: {
          circleCenterLng: longitude,
          circleCenterLat: latitude,
        },
      });
    }
    if (value === '2') {
      dispatch({
        type: 'policeSentiment/getPoliceList',
        payload: {
          circleCenterLng: longitude,
          circleCenterLat: latitude,
        },
      });
    }
  }
  function onUnableClick() {
    Message.warning('功能待开发');
  }
  useEffect(() => {
    if (reCall) {
      handleSizeChange(num);
      dispatch({
        type: 'policeSentiment/setPoliceDetailShouldUpdate',
        payload: {
          reCall: false,
        },
      });
    }
  })
  // 模板类型
  function template() {
    let tem = null;
    switch (num) {
      case '2':
        tem = <Record longitude={longitude} latitude={latitude} />;
        break;
      case '3':
        tem = <Stackedcolumn />;
        break;
      case '4':
        tem = <PoliceForces/>;
        break;
      default:
        tem = <Monitor />;
    }
    return tem;
  }
  return (
    <div className={styles.PoliceAlarmDetail}>
      <div className={styles.header}>
        {/* <Step /> */}
        <div>110警情</div>
        <Icon type="close" onClick={() => {
            dispatch({
              type: 'policeSentiment/setPoliceAlarmPopupVisible',
              payload: {
                policePopupVisible: false,
              },
            });
          recoverAlarmPoliceState && recoverAlarmPoliceState();
          }} />
      </div>
      <div className={styles.conrainerBox}>
        <div className={styles.containerTop}>
          <div className={styles.topTitle}>
            {/* <div>求救</div> */}
            <Badge count={'一般'} style={{ backgroundColor: '#BE7942', color: '#fff' }} />
            <div>{dealOrgName}</div>
          </div>
          <div className={styles.textInfo} title={message}>
            {message && message.length > 84 ?  message.slice(0, 84) + '...' : message}
          </div>
          <div className={styles.operationBtn} onClick={onUnableClick}>
            {!addr ? (
              <div>
                <img src={require(`@/assets/images/dw.png`)} />
                <span>标记</span>
              </div>
            ) : (
              <div>
                <img src={require(`@/assets/images/dw_reset.png`)} />
                <span>重置</span>
              </div>
            )}
          </div>
        </div>
        <div className={styles.containerBottom}>
          <ul className={styles.oul}>
            <li className={styles.oli}>
              <span>报警地址：</span>
              <div title={addr}>{addr && addr.length > 10 ?  addr.slice(0, 10) + '...' : addr}</div>
            </li>
            <li className={styles.oli}>
              <span>报警电话：</span>
              <div>
                {reportPhone}/{reportName || '匿名'}
              </div>
            </li>
            <li className={styles.oli}>
              <span>报警时间：</span>
              <div>{caseTime}</div>
            </li>
          </ul>
          <div className={styles.tab}>
            <Radio.Group value={num} onChange={e => handleSizeChange(e.target.value)}>
              <Radio.Button
                style={{ width: '63px', height: '63px', textAlign: 'center', fontSize: '12px' }}
                value="1"
              >
                <img
                  src={
                    num === '1'
                      ? require(`@/assets/images/monitor-active.png`)
                      : require(`@/assets/images/monitor.png`)
                  }
                  alt=""
                />
                <div>周边监控</div>
              </Radio.Button>
              <Radio.Button
                style={{ width: '63px', height: '63px', textAlign: 'center', fontSize: '12px' }}
                value="2"
              >
                <img
                  src={
                    num === '2'
                      ? require(`@/assets/images/police-active.png`)
                      : require(`@/assets/images/police.png`)
                  }
                  alt=""
                />
                <div>周边警力</div>
              </Radio.Button>
              <Radio.Button
                onClick={onUnableClick}
                style={{ width: '60px', height: '63px', textAlign: 'center', fontSize: '12px' }}
                value="3"
              >
                <img
                  src={
                    num === '3'
                      ? require(`@/assets/images/manag-active.png`)
                      : require(`@/assets/images/manag.png`)
                  }
                  alt=""
                />
                <div>处置过程</div>
              </Radio.Button>
              <Radio.Button
                onClick={onUnableClick}
                style={{ width: '63px', height: '63px', textAlign: 'center', fontSize: '12px' }}
                value="4"
              >
                <img
                  src={
                    num === '4'
                      ? require(`@/assets/images/record_active.png`)
                      : require(`@/assets/images/record.png`)
                  }
                  alt=""
                />
                <div>人员记录</div>
              </Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>
      <div className={styles.tep}>{template()}</div>
    </div>
  );
}
export default connect(({ policeSentiment, map: {recoverAlarmPoliceState} }) => {
  return {
    policeSentiment,
    recoverAlarmPoliceState,
  };
})(PoliceAlarmDetail);
