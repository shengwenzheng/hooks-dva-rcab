import React from 'react';
// import videojs from 'video.js';
// import './videojs-flash.es';
import FlvJs from 'flv.js';
const zhCN = require('video.js/dist/lang/zh-CN.json');
zhCN['Picture-in-Picture'] = '画中画';
window.videojs = require('video.js/dist/video.js');
window.videojs.addLanguage('zh-CN', zhCN);

window.flvjs = FlvJs;
require('videojs-flvjs/dist/videojs-flvjs.js');
const nodeMap = new Map();

export default class VideoPlayerFLV extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
      wrapId: 'warpDiv',
    };
  }

  componentDidMount() {
    // console.log(this.props, 'video componentDidMount', new Date().toString());
    if (this.id) nodeMap.set(this.id, this.videoNode);
    const { videojs } = window;
    this.player = videojs(this.videoNode, this.props, () => {
      // console.log('onPlayerReady', new Date().toString());
    });
  }

  // destroy player on unmount
  componentWillUnmount() {
    // console.log('video 已注销');
    if (this.player) {
      this.player.dispose();
      this.player = null;
    }
  }

  setUrl = url => {
    this.setState(url);
  };

  reset(src) {
    const { videojs } = window;
    this.player = videojs(this.videoNode, this.props, () => {
      // console.log('onPlayerReady', new Date().toString());
    });
    this.player.src(src);
  }

  setId = id => {
    this.id = id;
    nodeMap.get(id) && (this.isPlayed = true);
    this.videoNode = nodeMap.get(id) || this.videoNode;
  };

  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {
    const { url, wrapId } = this.state;
    return (
      <div>
        <div data-vjs-player id={wrapId}>
          <video
            ref={node => {
              this.videoNode = node;
              return node;
            }}
            url={url}
            className="video-js"
            width="500"
            height="300"
            autoPlay
          />
        </div>
      </div>
    );
  }
}
