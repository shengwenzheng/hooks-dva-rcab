import react from 'react';
import styles from './index.less';
import { Icon } from 'antd';
import { connect } from 'dva';

function Camera(props) {
  const {playingList, dispatch} = props;
  function closeCamera(id) {
    if (playingList.find(d=> d.deviceId === id) === undefined) {
      return;
    }
    const newList = []
    playingList.map((item) => {
      if (item.deviceId !== id) {
        newList.push(item)
      }
    })
    dispatch({
      type: 'policeSentiment/setPlayingList',
      payload: {
        currentCheckedVideoList: newList
      }
    })
  }
  return (
    <div className={styles.cameraList}>
      {playingList.map(item => {
        return (
          <div className={styles.cameraBox} key={item.id}>
            <div className={styles.title}>
              {item.name}
              <Icon type="close" onClick={() => {
                closeCamera(item.deviceId)
              }} />
            </div>
            <div className={styles.camera}>
              <video />
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default connect(({ policeSentiment }) => {
  return {
    playingList: policeSentiment.playingList,
  };
})(Camera);
