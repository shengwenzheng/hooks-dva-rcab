import { useState, useEffect } from 'react';
import Menu from './components/Menu';
import Modaldet from './components/Modaldet';
import Subway from './components/Subway';
import CheckPoint from './components/CheckPoint';
import Map from '@/components/map/war';
import { connect } from 'dva';
import styles from './index.scss';
import PoliceAlarmDetail from '../PoliceSentiment/components/policeAlarm/detail.jsx';

function OTF(props) {
  const {
    modal135Visible,
    subwayModalVisible,
    checkpointVisible,
    currentPoliceObj,
    policePopupVisible,
    dispatch,
  } = props;

  useEffect(() => {
    props.dispatch({
      type: 'map/setLayerChecked',
      payload: {
        policeAlarm: false,
      },
    });
  });

  return (
    <div className={styles.otfContainer}>
      {/* <Map /> */}
      <div className={styles.blockSty}>
        <Menu />
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
    </div>
  );
}

export default connect(
  ({
    fight: { modal135ChangeFn, modal135Visible, subwayModalVisible, checkpointVisible },
    policeSentiment: { currentPoliceObj, policePopupVisible },
  }) => ({
    currentPoliceObj,
    policePopupVisible,
    modal135ChangeFn,
    modal135Visible,
    subwayModalVisible,
    checkpointVisible,
  }),
)(OTF);
