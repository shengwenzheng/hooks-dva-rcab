import React from 'react';
import styles from './index.less';
import { connect } from 'dva';
import _ from 'lodash';

function FacePolice(props) {
  var {
    policeSentiment: { currentPoliceObj },
    locationPoliceAlarm,
    params: {
      id,
      caseTime,
      addr,
      longitude,
      latitude,
      targetName,
      similarity,
      faceSearchPic,
      pic,
      targetSource,
    },
    realTimeList,
    dispatch
  } = props;
  var time = caseTime && caseTime.split(' ').length === 2 && caseTime.split(' ')[1];
  return (
    <div
      className={currentPoliceObj && currentPoliceObj.id === id ? styles.face_recognitionActive : styles.face_recognition}
      onClick={() => {
        dispatch({
          type: 'policeSentiment/setPoliceAlarmPopupVisible',
          payload: {
            policePopupVisible: false,
          },
        });
        dispatch({
          type: 'policeSentiment/setCurrentSelectedPoliceObj',
          payload: {
            id,
          },
        }).then(() => {
          let Obj = props.policeSentiment.currentPoliceObj;
          if (Object.keys(Obj).length < 1) {
            Obj = _.find(realTimeList, d => d.id === id);
          }
          console.log(Obj)
          locationPoliceAlarm(Obj);
        })
      }}
    >
      <div className={styles.center_top_name}>
        <span>{time}</span>
        <span>
          {' '}
          {longitude && latitude ? (
            <img src={require(`@/assets/images/dw_reset.png`)} alt="" />
          ) : (
            <img src={require(`@/assets/images/dw.png`)} alt="" />
          )}
          人脸布控警告
        </span>
      </div>
      <div className={styles.center_center_name}>
        <span title={targetName}>{targetName && targetName.length > 6 ?  targetName.slice(0, 6) + '...' : targetName}</span>/
        <span title={targetSource}>{targetSource && targetSource.length > 12 ?  targetSource.slice(0, 12) + '...' : targetSource}</span>
      </div>
      <div className={styles.center_bottom_name}>
        <div className={styles.center_bottom_img}>
          <div className={styles.img_box}>
            <img
              className={faceSearchPic ? null : styles.noneImg}
              src={faceSearchPic || require(`@/assets/images/nonexistent.png`)}
            />
          </div>
          <p>线索图</p>
        </div>
        <div className={styles.center_bottom_text}>
          <p>相似度</p>
          <p>{similarity * 100}%</p>
        </div>
        <div className={styles.center_bottom_img}>
          <div className={styles.img_box}>
            <img
              className={pic ? null : styles.noneImg}
              src={
                pic ? 'data:image/jpg;base64,' + pic : require(`@/assets/images/nonexistent.png`)
              }
            />
          </div>
          <p>布控图</p>
        </div>
      </div>
      <div className={styles.center_buttom_text}>
        <img src={require(`@/assets/images/monitor-active.png`)} alt="" />
        <span>{addr}</span>
      </div>
    </div>
  );
}
export default connect(({ policeSentiment, map }) => {
  return {
    policeSentiment,
    locationPoliceAlarm: map.locationPoliceAlarm
  };
})(FacePolice);
