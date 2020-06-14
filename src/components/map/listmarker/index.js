import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { Marker, Popup } from 'react-leaflet';
import VideoPlayer from '../../video/index-rtmp';
import { message } from 'antd';
import {
  videoClickedIcon,
  videoIcon,
  videoPlayerMap,
  videoSelectedIcon,
  videoPointIcon,
  smallVideoIcon,
} from '../constant/index';
let markerClickedTime = ''; // 上次视频播放时间
let videoMarkers = [];

const MyPopupMarker = ({
  key,
  position,
  icon,
  data,
  markerRef,
  videoPlayerRef,
  videoJsOptions,
  markerClickHandler,
  closeVideoPopup,
}) => (
  <Marker
    key={key}
    position={position}
    icon={icon}
    onClick={markerClickHandler}
    attribution={{ data }}
    ref={markerRef}
  >
    {/*<Popup onClose={closeVideoPopup} className="video-popup">*/}
    {/*  <div className="title">{data.deviceName}</div>*/}
    {/*  <VideoPlayer {...videoJsOptions} ref={videoPlayerRef} />*/}
    {/*</Popup>*/}
  </Marker>
);

const MyMarkersList = ({
  markers,
  markerClickHandler,
  closeVideoPopup,
  videoPlayerRef,
  selectedData,
}) => {
  const items = markers.map(({ key, id, ...props }) => (
    <MyPopupMarker
      key={id}
      markerClickHandler={markerClickHandler}
      closeVideoPopup={closeVideoPopup}
      videoPlayerRef={videoPlayerRef}
      icon={getIcon({ ...props }, selectedData)}
      {...props}
    />
  ));
  return <Fragment>{items}</Fragment>;
};

const getIcon = (item, selectData) => {
  const exist = selectData.find(d => d.deviceId === item.data.deviceId);
  return selectData.length === 0 || exist ? videoIcon : smallVideoIcon;
};

export class ListMarker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: [
        // eg: { key: 'marker1', position: [51.5, -0.1], content: 'My first popup' },
      ],
    };
  }

  /**
   * 摄像头点位单击响应函数
   * @param e
   */
  markerClickHandler = e => {
    if (markerClickedTime === '') {
      markerClickedTime = new Date().getTime();
    } else {
      const timeInterval = (new Date().getTime() - markerClickedTime) / 1000;
      if (timeInterval < 2) {
        message.destroy();
        message.info('2秒之内不能重复播放视频!');
        return;
      }
    }
    const mapSelectData = this.props.mapSelectData;
    if (this.clickMarker) {
      let b = false;
      if (mapSelectData) {
        b = mapSelectData.find(item => item.deviceId == this.clickMarker.deviceId);
      }
      const icon = b ? videoSelectedIcon : videoIcon;
      this.setDeviceListIcon([this.clickMarker], icon);
    }
    const attr = e.target.options.attribution;
    const deviceId = attr.data.deviceId;
    const lat = Number(attr.data.latitude) + 0.00065;
    const videoDivId = 'videoPopupDiv-' + deviceId; // 视频播放DIV的ID
    this.props.setCenter(lat, attr.data.longitude);
    this.setDeviceListIcon([attr.data], videoClickedIcon);
    // 设置播放参数
    // const url = attr.data.playUrl;
    if (this.videoTimeOut) {
      clearTimeout(this.videoTimeOut);
    }

    const marker = this.props.markerGroup[attr.data.deviceId].current.leafletElement;
    if (attr.popup) {
      attr.popup = null;
      return;
    }
    const popupContent = `<div><div class="title">${attr.data.deviceName ||
      attr.data.name}</div><div id=${videoDivId}></div></div>`;
    marker &&
      marker
        .unbindPopup()
        .bindPopup(popupContent, { className: 'video-popup' })
        .openPopup()
        .on('popupclose', this.closeVideoPopup);
    attr.popup = true;

    setTimeout(() => {
      ReactDOM.render(
        <VideoPlayer ref={this.props.videoPlayerRef} />,
        document.getElementById(videoDivId),
      );
    }, 10);

    const type = e.isplayback ? 'common/videoPlayBacksStart' : 'common/videoStreamStart';
    const time = e.timestamp;
    this.props
      .dispatch({
        type,
        payload: { deviceId, time },
      })
      .then(res => {
        if (res.errorCode === 'SUCCESS' || res.message === '成功') {
          const { current } = this.props.videoPlayerRef;
          let { player } = current;
          const oldPlayer = videoPlayerMap.get(attr.data.deviceId);
          if (!oldPlayer && player) {
            videoPlayerMap.set(attr.data.deviceId, current.player);
          }
          player = oldPlayer || player;

          const url = res.data[0].playUrl;
          // ----------------------记录点击过的摄像头ID和路线点播sessionId-------------this赋值标记------------------
          this.deviceId = deviceId;
          this.sessionId = res.data[0].sessionId;
          this.videoTimeOut = setTimeout(() => {
            // console.log(`url=${url}`, new Date().toString());
            const isOpen = this.props.markerGroup[attr.data.deviceId].current.leafletElement
              .getPopup()
              .isOpen();
            if (isOpen && player) {
              player.clearTimeout();
              current.setId(attr.data.deviceId);
              player.techName_ = null;
              if (oldPlayer) {
                current.setState({ url });
                current.componentDidMount();
              }
              const videoType = url.indexOf('rtmp:') === -1 ? 'video/flv' : 'rtmp/flv';
              player.src({
                src: url,
                type: videoType,
                language: 'zh-CN',
              });
            }
          }, 100);
        }
      });

    // ----------------------记录点击过的摄像头-------------this赋值标记------------------
    this.clickMarker = attr.data;
  };

  closeVideoPopup = e => {
    // console.log('closeVideoPopup', e.target.options.attribution);
    e.target.options.attribution.popup = null;
    const deviceId = this.deviceId;
    const sessionId = this.sessionId;
    const type = sessionId ? 'common/videoPlayBacksStop' : 'common/videoStreamStop';
    const payload = sessionId ? { deviceId, sessionId } : { deviceId };
    this.props
      .dispatch({
        type,
        payload,
      })
      .then(res => {
        if (res && (res.errorCode === 'SUCCESS' || res.message === '成功')) {
          // console.log('视频已关闭deviceId:', deviceId);
        }
      });
  };

  /**
   * 设置摄像头选中状态
   */
  setDeviceListIcon = (deviceList, icon) => {
    setTimeout(() => {
      if (!Array.isArray(deviceList)) return;
      deviceList.forEach(item => {
        const device = this.props.markerGroup[item.deviceId];
        device.current.leafletElement.setIcon(icon);
      });
    }, 10);
  };

  /**
   * 设置所有摄像头用同一种图标
   * @param icon
   */
  setAllDeviceIcon = icon => {
    this.setDeviceListIcon(videoMarkers, icon);
  };

  //在render函数调用前判断：如果前后props中markers数量不变，通过return false阻止render调用
  shouldComponentUpdate(nextProps, nextState) {
    if (
      nextProps.markers.length === this.props.markers.length &&
      nextProps.mapSelectData.length === this.props.mapSelectData.length
    ) {
      return false;
    }
    return true;
  }

  render() {
    // console.log('list marker render, marker length = ', this.props.markers.length);
    videoMarkers = this.props.markers;
    return (
      <MyMarkersList
        markers={videoMarkers}
        markerClickHandler={this.markerClickHandler}
        closeVideoPopup={this.closeVideoPopup}
        videoPlayerRef={this.props.videoPlayerRef}
        selectedData={this.props.mapSelectData}
      />
    );
  }
}
