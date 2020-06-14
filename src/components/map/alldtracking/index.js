import { Component, Fragment } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { doubtIcon } from '@/components/map/constant';

const { L } = window;
let setState = () => {};
let openVideo = () => {};

const DoubtPoint = ({ data }) => {
  const items = data.map(item => (
    <Marker
      position={item.position}
      icon={doubtIcon}
      zIndexOffset={500 - 1}
      data={item}
      onclick={myOpenVideo}
      key={'alltracking_' + item.deviceId + '_' + new Date().getTime()}
    ></Marker>
  ));
  return <Fragment>{items}</Fragment>;
};
const myOpenVideo = item => {
  openVideo({ deviceBean: item.target.options.data });
};
export class AllDTracking extends Component {
  constructor(props) {
    super(props);
    setState = this.setState;
    this.state = {
      data: [],
    };
  }
  componentWillMount() {
    //通过pros接收父组件传来的方法
    this.props.onRef(this);
  }
  componentWillUnmount() {
    this.drawDoubtPoint();
  }
  drawDoubtPoint = data => {
    if (Array.isArray(data)) {

      data = data.filter(
        item =>
          item.latitude !== 0 &&
          item.latitude !== '0' &&
          item.longitude !== 0 &&
          item.longitude !== 0,
      );
      if (data.length > 0) {
        data.map(item => (item.position = L.latLng(item.latitude, item.longitude)));
        this.setState({ data: [] });
        setTimeout(() => this.setState({ data }), 100);
      }
    } else {
      this.setState({ data: [] });
    }
  };
  //在render函数调用前判断条件 通过return false阻止render调用
  shouldComponentUpdate(nextProps, nextState) {
    let rst = false;
    if (this.state.data.length === nextState.data.length) {
      this.state.data.map((item, index) => {
        if (
          item.deviceId !== nextState.data[index].deviceId ||
          item.id !== nextState.data[index].id
        ) {
          rst = true;
        }
      });
      if (nextState.data.length === 0) rst = true;
    } else {
      rst = true;
    }
    return rst;
  }
  render() {
    const { data } = this.state;
    openVideo = this.props.openVideoPopup;
    return <DoubtPoint data={data} />;
  }
}
