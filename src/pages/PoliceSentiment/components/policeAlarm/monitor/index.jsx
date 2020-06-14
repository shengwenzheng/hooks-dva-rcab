import { Component } from 'react';
import styles from './index.less';
import { Button } from 'antd';
import { connect } from 'dva';
class Monitor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visabled: true,
      currentCheckedVideoList: []
    };
  }
  componentDidMount() {
    this.props.dispatch({
      type: 'policeSentiment/mapActions',
      payload: {
        monitorOpenVideo: this.monitorOpenVideo,
        monitorCloseVideo: this.monitorCloseVideo,
      },
    });
  }
  monitorOpenVideo = deviceId => {
    this.activeCamera(deviceId, true, true);
  };
  monitorCloseVideo = () => {
    this.activeCamera(-1, true, true);
  };

  updateCheckedList = (item) => {
    const list = this.state.currentCheckedVideoList;
    let newList = [];
    if (list.find(d => d.deviceId === item.deviceId) === undefined) {
      if (list.length >= 3) {
        list.shift();
      }
      list.push(item);
      newList = list;
    } else {
      list.map(d => {
        if (d.deviceId !== item.deviceId) {
          newList.push(d)
        }
      })
    }

    this.setState({
      currentCheckedVideoList: newList
    })
  }

  activeCamera = (cameraObj, flag = false, isClear = false) => {
    const { videoList } = this.props;
    let newData = videoList.map(item => {
      let it = item;
      if (cameraObj.deviceId === it.deviceId) {
        it.isOpen = !!flag;
        it.active = true;
      } else {
        it.active = false;
        if (isClear) {
          it.isOpen = false;
        }
      }
      return it;
    });
    this.setState({
      visabled: false,
    });
    this.props.dispatch({
      type: 'policeSentiment/setVideoList',
      payload: {
        newData,
      },
    });
    this.updateCheckedList(cameraObj)
  };
  openVideo = () => {
    const {
      videoList,
      mapAction: { openVideoPopupFn },
    } = this.props;
    let params = videoList.find(item => {
      return item.active;
    });
    this.activeCamera(params.deviceId, true, true);
    openVideoPopupFn(params);

    this.props.dispatch({
      type: 'policeSentiment/setPlayingList',
      payload: {
        currentCheckedVideoList: this.state.currentCheckedVideoList
      },
    })
    // this.setState({
    //   currentCheckedVideoList: []
    // })
  };
  render() {
    const { videoList, playingList } = this.props;
    const { visabled, currentCheckedVideoList } = this.state;
    // console.log(videoList)
    return (
      <div className={styles.Monitor}>
        <div className={styles.topBox}>
          <div className={styles.title}>
            <span>摄像监控总数：</span>
            <span>{videoList.length}</span>
          </div>
          <ul className={styles.oul}>
            {videoList.length &&
              videoList.map(item => {
                const isChecked = currentCheckedVideoList.find(d => item.deviceId === d.deviceId) !== undefined;
                const isPlaying = playingList.find(d => item.deviceId === d.deviceId) !== undefined;
                return (
                  <li
                    key={item.deviceId}
                    className={isChecked ? styles.activeOli : styles.oli}
                    onClick={() => this.activeCamera(item)}
                  >
                    <div className={styles.caraName}>
                      <img src={require(`@/assets/images/monitor-active.png`)} alt="" />
                      <span>{item.name}</span>
                    </div>
                    {isPlaying ? (
                      <span style={{ color: '#428A1A' }}>播放中...</span>
                    ) : isChecked ? (
                      <img src={require(`@/assets/images/ok.png`)} alt="" />
                    ) : null}
                  </li>
                );
              })}
          </ul>
        </div>
        <div className={styles.openBtn}>
          <Button onClick={this.openVideo} disabled={visabled}>
            打开监控
          </Button>
        </div>
      </div>
    );
  }
}
export default connect(({ policeSentiment, map }) => {
  return {
    videoList: policeSentiment.videoList,
    playingList: policeSentiment.playingList,
    mapAction: map.mapAction,
  };
})(Monitor);
