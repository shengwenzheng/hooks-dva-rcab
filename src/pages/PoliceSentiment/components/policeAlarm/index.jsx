import React from 'react';
import styles from './index.less';
import { connect } from 'dva';

const caseStateType = {
  1: '分派',
  2: '签收',
  3: '到达',
  4: '反馈',
  5: '完成',
};
function PoliceAlarm(props) {
  var {
    policeSentiment: { openPolicePopupFunc, currentPoliceObj },
    params: { id, caseTime, addr, longitude, latitude, message, caseState, dealOrgName },
  } = props;
  function classType() {
    let styleClass = null;
    switch (caseState) {
      case 1:
        styleClass = styles.assignment;
        break;
      case 2:
        styleClass = styles.signFor;
        break;
      case 3:
        styleClass = styles.arrive;
        break;
      case 4:
        styleClass = styles.feedback;
        break;
      default:
        styleClass = styles.finish;
    }
    return styleClass;
  }
  var time = caseTime && caseTime.split(' ').length === 2 && caseTime.split(' ')[1];
  return (
    <div
      className={currentPoliceObj && currentPoliceObj.id === id ? styles.center_data_active : styles.center_data}
      onClick={() => {
        openPolicePopupFunc({ id });
      }}
    >
      <div className={styles.center_top_name}>
        <span>{time}</span>
        <span className={styles.center_criticality}>一般</span>
        <span>
          {' '}
          {longitude && latitude ? (
            <img src={require(`@/assets/images/dw_reset.png`)} alt="" />
          ) : (
            <img src={require(`@/assets/images/dw.png`)} alt="" />
          )}
          110警情
        </span>
      </div>
      <div className={styles.center_center_name}>
        <div className={styles.type_location}>
          <p className={styles.type_location_center}>
            <span className={classType()}>{caseStateType[caseState]}</span>
            {addr}
          </p>
          <p className={styles.type_location_police}>{message}</p>
        </div>
      </div>
      <div className={styles.center_bottom}>
        <span>辖区：</span>
        <span title={dealOrgName}>{dealOrgName}</span>
      </div>
    </div>
  );
}

export default connect(({ policeSentiment }) => {
  return {
    policeSentiment,
  };
})(PoliceAlarm);
