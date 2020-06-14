import React, { Component, createRef } from 'react';
import { connect } from 'dva';
import data from '@/assets/geojson/subway.json';
import { Polyline, Marker, Popup, Tooltip, LayerGroup } from 'react-leaflet';
import { gcj02towgs84, wgs84togcj02 } from '@/components/map/gpsconvert/gpsConvert';
import { stationPointIcon, subwayIcon, subwaySelectedIcon } from '../constant/index';

class Subway extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stationData: [],
      subwayData: [],
      selectedStationId: null,
    };
    this.subwayData = [];
    this.color = [];
    this.lastClickedLayer = null;
    this.refList = new Map();
  }
  componentDidMount() {
    data.map(item => {
      const { linepoint } = item;
      let tmp = linepoint
        .split(';')
        .filter(item => item !== '')
        .map(ii => (ii = wgs84togcj02(...ii.split(','))));
      item.positions = [tmp];
    });

    this.color = [
      'red',
      'orange',
      'Chocolate',
      'green',
      'blue',
      'black',
      'Indigo',
      'Pink',
      'yellow',
    ];
    const subwayData = data.filter(
      (item, index) => index === 0 || index === 1 || index === 3 || index === 4,
    );
    let stationData = [];
    subwayData.forEach(item => (stationData = stationData.concat(item.station)));
    stationData.map((item, index) => {
      item.position = item.lonlat.split(',').reverse();
      item.uuid = `${item.uuid}_${index}`;
    });
    this.setState({
      subwayData,
      stationData,
    });
    this.props.dispatch({
      type: 'map/locationSubway',
      payload: {
        locationSubway: this.locationSubway,
      },
    });
    this.props.dispatch({
      type: 'map/recoverSubwayState',
      payload: {
        recoverSubwayState: this.recoverState,
      },
    });
  }
  onMouseOver(e) {
    e.target.setStyle({ weight: 5 });
  }
  onMouseOut(e) {
    const weight = e.target.clicked ? 5 : 3;
    e.target.setStyle({ weight });
  }
  onClick = e => {
    if (this.lastClickedLayer && e.target !== this.lastClickedLayer) {
      this.lastClickedLayer.setStyle({ weight: 3 });
      this.lastClickedLayer.clicked = false;
    }
    const { station } = e.target.options.data;
    station.map(item => (item.position = wgs84togcj02(...item.lonlat.split(','))));
    // this.setState({ stationData: !e.target.clicked ? station : [] });
    e.target.clicked = !e.target.clicked;
    this.lastClickedLayer = e.target;
  };
  stationOnClicker = e => {
    const { uuid } = e.target.options.data;
    e.target.clicked = !e.target.clicked;
    const bNewClicked = e.target.clicked && uuid !== this.state.selectedStationId;
    this.props.dispatch({
      type: 'fight/subwayModalFn',
      payload: {
        id: uuid.split('_')[0],
        show: bNewClicked,
      },
    });
    const selectedStationId = bNewClicked ? uuid : null;
    this.setState({ selectedStationId });
  };
  getRef = item => {
    const key = item.uuid;
    let r = this.refList.get(key);
    if (!r) {
      r = createRef();
      this.refList.set(key, r);
    }
    return r;
  };
  locationSubway = item => {
    const { longitude, latitude } = item;
    this.props.mapAction.setCenterFn(latitude, longitude);
    let dest = null;
    for (const [key, mk] of this.refList) {
      const { lat, lng } = mk.current.leafletElement.getLatLng();
      if (longitude === lng && latitude === lat) {
        this.setState({ selectedStationId: key });
        break;
      }
    }
  };
  recoverState = () => {
    this.setState({
      selectedStationId: null,
    });
  };
  render() {
    window.g_subway = this;
    const { stationData, subwayData, selectedStationId } = this.state;
    return (
      <LayerGroup>
        {subwayData.map((item, index) => (
          <Polyline
            key={'subway_' + index}
            positions={item.positions}
            weight={3}
            color={this.color[index]}
            onMouseOver={this.onMouseOver}
            onMouseOut={this.onMouseOut}
            onClick={this.onClick}
            data={item}
          />
        ))}
        {stationData.map((item, index) => (
          <Marker
            position={item.position}
            icon={item.uuid === selectedStationId ? subwaySelectedIcon : subwayIcon}
            onClick={this.stationOnClicker}
            data={item}
            key={item.uuid === selectedStationId ? `${item.uuid}_selected` : item.uuid}
            ref={this.getRef(item)}
          >
            <Tooltip
              key={
                item.uuid === selectedStationId
                  ? `${item.uuid}_tooltip_selected`
                  : `${item.uuid}_tooltip`
              }
              closeOnClick={false}
              closeButton={false}
              permanent={item.uuid === selectedStationId}
              direction="top"
              offset={[0, -8]}
            >
              {item.name}
            </Tooltip>
          </Marker>
        ))}
      </LayerGroup>
    );
  }
}
export default connect(({ map, fight: { subwayStationList } }) => {
  return {
    mapAction: map.mapAction,
    subwayStationList,
  };
})(Subway);
