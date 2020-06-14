import React from 'react';
import { connect } from 'dva';
import styles from './index.scss';

function CameraBox(props) {
  const { camera135 } = props;
  
  const playVideo = (obj) => {
    props.dispatch({
      type: 'fight/playVideo',
      payload: obj
    });
  }
  return (
    <div className={styles.cameraBox}>
      <div>摄像头监控总数: {camera135.length}</div>
      <ul>
        {
          camera135.map(value => <li key={value.id} onClick={() => playVideo(value)}>
            <img src={require('@/assets/images/monitor-active.png')} alt="icon"/>
            {value.name}
          </li>)
        }
      </ul>
    </div>
  );
}

export default connect(({fight:{ camera135 }}) => ({camera135}))(CameraBox);