/**
 * 圈选
 */
import RadarCanvas from '../radar/index';
import { dragIcon } from '@/components/map/constant';
import circle from '@turf/circle';
import * as turf from '@turf/helpers';
import booleanWithin from '@turf/boolean-within';

const { L } = window;

class CircleSelect {
  constructor() {
    Object.assign(this, {
      startPoint: null,
      endPoint: null,
      circle: null,
      layer: L.layerGroup(),
      color: '#2950B8',
      map: null,
      parent: null,
      clickCount: 0,
      radius: null,
      radiusM: null,
      draggable: true,
      tempLines: L.polyline([], { dashArray: 5 }),
      tooltip: null,
      redPt: null,
      cancelMarker: null,
      isFixRadius: false,
      radar: null,
      timeStep: null,
      isShowRader: false, // 是否显示雷达动效
      animateCircle: null,
      timerList: [],
      radarShodow: null, // 雷达里的阴影
      callback: null,
      id: null,
      bShowTooltip: false,
      bStartDrag: false,
    });
  }
  init(me) {
    this.map = me.mapRef.current.contextValue.map;
    this.parent = me;
    this.props = me.props;
  }
  addCircle() {
    const radius = this.getRadius();
    this.radiusM = radius.toFixed(2);
    if (!this.circle) {
      this.circle = L.circle(this.startPoint, radius, {
        color: 'white',
        fillColor: this.color,
        fillOpacity: 0.2,
        opacity: 0,
      }).addTo(this.map);
    } else {
      this.circle.setRadius(radius);
    }
    if (this.draggable && this.clickCount >= 1) {
      // this.parent.setDraggableCircle(this.endPoint);
      this.dragMarker && this.map.removeLayer(this.dragMarker);
      this.dragMarker = L.marker(this.endPoint, { icon: dragIcon, draggable: 'true' }).addTo(
        this.map,
      );
      this.dragMarker
        .on('drag', e => {
          this.endPoint = e.target.getLatLng();
          const radius = this.getRadius();
          this.circle.setRadius(radius);
          const radiusM = radius.toFixed(2);
          e.target.getTooltip().setContent(`半径：${radiusM}米`);

          const rst = this.get45Point(this.startPoint, this.endPoint, 1000);
          const cellatlng = new L.LatLng(rst.lat, rst.lng);
          this.cancelMarker.setLatLng(cellatlng);
        })
        .bindTooltip(`半径：${this.radiusM}米`, {
          offset: [5, 0],
          direction: 'right',
        })
        .on('dragend', () => this.dragEndHander());
    }
    this.circle.on('click', () => {
      if (this.saveTooltip) {
        this.saveTooltip.addTo(this.map);
        this.setClickEvent(this.saveTooltip);
      }
    });
    // const ls = [center, end];
    // this.tempLines.setLatLngs(ls);
    // this.tempLines.addTo(this.layer);
    if (this.clickCount > 1 || this.draggable) {
      this.addCancelBtn();
    }
  }
  getRadius() {
    const center = this.startPoint;
    const end = this.endPoint;
    const dx = center.lng - end.lng;
    const dy = center.lat - end.lat;
    let radius = dx * dx + dy * dy;
    this.radius = Math.sqrt(radius);
    radius = L.latLng(center.lat, center.lng).distanceTo(L.latLng(end.lat, end.lng));
    return radius;
  }
  setId() {
    this.id = 'circle_' + new Date().getTime();
  }
  setTooltip() {
    if (!this.bShowTooltip || !this.circle) return;
    const { preventCircleMap, currentEditPreventId } = this.parent;
    const map = preventCircleMap.get(currentEditPreventId);
    map && map.eachLayer(item => item._icon && item.closePopup());

    this.saveTooltip && this.map.removeLayer(this.saveTooltip);
    const tooltip = L.tooltip({
      direction: 'top',
      permanent: false,
      interactive: true,
      noWrap: true,
      opacity: 0.9,
    });
    const content = `<div class="preventCircle-polygon">
                      <select>
                        <option value="0">核心管控区</option>
                        <option value="1">重点控制区</option>
                        <option value="2">关注分流区</option>
                      </select>
                      <span class="preventCircle-polygon-btn">保存</span>
                    </div>`;
    tooltip.setContent(content);
    const lat = this.circle.getBounds().getNorth();
    const lng = this.startPoint.lng;
    tooltip.setLatLng([lat, lng]);
    tooltip.addTo(this.map);
    this.setClickEvent(tooltip);
    this.saveTooltip = tooltip;
  }
  dragEndHander() {
    this.setTooltip();
    this.showTooltip();
    this.bringbackToFront();
    this.parent.savePrevent && this.parent.savePrevent(this.parent.currentEditPreventType, false);
  }
  showTooltip() {
    if (this.circle) {
      const lat = this.circle.getBounds().getNorth();
      const lng = this.startPoint.lng;
      this.saveTooltip && this.saveTooltip.setLatLng([lat, lng]);
    }
  }
  hideTooltip() {
    this.saveTooltip && this.map.removeLayer(this.saveTooltip);
  }
  /**
   * 处理图形覆盖情况
   */
  bringbackToFront() {
    if (!this.parent.preventCircleMap) {
      return;
    }
    const options = { steps: 64, units: 'degrees', properties: {} };
    const { lat, lng } = this.startPoint;
    const tCircle = circle([lng, lat], this.radius, options);
    const key = this.parent.currentEditPreventId;
    const preventCircle = this.parent.preventCircleMap.get(key);
    if (preventCircle) {
      const layers = preventCircle.getLayers();
      const result = [{ turf: tCircle, marker: this.circle }];
      layers.forEach(item => {
        if (item !== this.circle) {
          if (item.id && item.id.indexOf('circle') > -1) {
            const point = item.getLatLng();
            const _radius = this.meter2degree(item.getRadius());
            const _tCircle = circle([point.lng, point.lat], _radius, options);
            result.push({ turf: _tCircle, marker: item });
          } else if (!item._icon && !item.options.icon) {
            const { coordinates } = item.toGeoJSON().geometry;
            const tPolygon = turf.polygon(coordinates);
            result.push({ turf: tPolygon, marker: item });
          }
        }
      });

      result.sort((a, b) => {
        return booleanWithin(a.turf, b.turf) ? 1 : -1;
      });
      result.forEach(item => {
        const { marker } = item;
        marker && marker.bringToFront();
      });
    }
  }
  setClickEvent(tooltip) {
    const el = tooltip.getElement();
    el.addEventListener('click', e => L.DomEvent.stopPropagation(e));
    const bntSpan = el.getElementsByClassName('preventCircle-polygon-btn')[0];
    bntSpan.removeEventListener('click', this.savePrevent);
    bntSpan.addEventListener('click', this.savePrevent);
    el.style.pointerEvents = 'auto';
  }
  savePrevent = e => {
    L.DomEvent.stopPropagation(e); //阻止事件往map方向冒泡
    const parent = document.getElementsByClassName('preventCircle-polygon');
    if (parent.length > 0) {
      const child = parent[0].getElementsByTagName('select');
      if (child.length > 0) {
        const value = child[0].value;
        const text = child[0].selectedOptions[0].text;
        this.circle.typeObj = { value, text };
      }
    }
    this.select();
    // this.map.removeLayer(this.saveTooltip);
    this.parent.savePrevent(this.parent.currentEditPreventType, false);
    this.hideTooltip();
    // this.parent.bSavePrevent = false;
  };
  clear() {
    this.close();
    this.redPt && this.map.removeLayer(this.redPt);
  }
  close() {
    this.layer.clearLayers();
    this.radius = null;
    this.tooltip && this.tooltip.remove();
    this.parent.setState({ draggedCircle: [-30, -120] });
    this.clearEvent();
    this.cancelMarker && this.map.removeLayer(this.cancelMarker);
    this.cancelMarker = null;
    this.circle && this.map.removeLayer(this.circle);
    this.circle = null;
    this.clearAnimate();
    this.radarShodow && this.map.removeLayer(this.radarShodow);
    this.radarShodowInset && this.map.removeLayer(this.radarShodowInset);
    this.dragMarker && this.map.removeLayer(this.dragMarker);
    this.saveTooltip && this.map.removeLayer(this.saveTooltip);
  }
  clearEvent() {
    this.map
      .off('mousedown', this.mousedown)
      .off('mouseup', this.mouseup)
      .off('mousemove', this.mousemove);
  }
  mousedown = e => {
    const _this = this;
    if (_this.clickCount > 0) return;
    _this.clickCount++;
    // console.log(`_this.clickCount=${_this.clickCount}`);
    _this.circle = null;
    _this.map.dragging.disable();
    if (_this.clickCount == 1) {
      _this.startPoint = e.latlng;
      _this.redPt = L.circle(e.latlng, 1, {
        color: '#ff0000',
        fillColor: 'ff0000',
        fillOpacity: 1,
      });
      _this.map.addLayer(_this.redPt);
    }
    if (_this.isFixRadius && _this.radius == null) {
      let i = 0;
      while (i < 20) {
        (_i => {
          // eslint-disable-line no-loop-func
          setTimeout(() => {
            _this.timeStep = i;
            _this.endPoint = _this.getEndPoint(_this.startPoint, (1000 * (_i + 1)) / 20);
            _this.addCircle();
            if (_i == 19) {
              _this.createRadarAnimate();
              _this.select();
            }
          }, (1000 * (i + 1)) / 60);
        })(i);
        i++;
      }

      _this.map.off('mouseup', _this.mouseup).off('mousedown', _this.mousedown);
    } else {
      _this.map.on('mousemove', _this.mousemove);
    }
    _this.map.on('mouseup', _this.mouseup);
    if (_this.clickCount == 2) {
      // _this.addCircle();
    }
  };
  mousemove = e => {
    const _this = this;
    // if (!_this.startPoint) return;
    _this.endPoint = e.latlng;
    _this.addCircle();
    _this.map.on('mouseup', _this.mouseup);
  };
  mouseup = () => {
    if (this.endPoint || 1 < 2) {
      this.map.dragging.enable();
      // _this.setTooltip();
      if (!this.isFixRadius) {
        this.createRadarAnimate();
        this.select();
      }
      this.map
        .off('mousemove', this.mousemove)
        .off('mouseup', this.mouseup)
        .off('mousedown', this.mousedown);
      this.dragEndHander();
      this.setBDrawCircleOrRectangle();
    } else {
      this.map.on('mousemove', this.mousemove);
    }
  };
  setBDrawCircleOrRectangle = () => {
    setTimeout(() => (this.parent.bDrawCircleOrRectangle = false), 500);
  };
  triggerDragEvent = () => {
    this.circle.on({
      mousedown: () => {
        if (this.parent.bDrawCircleOrRectangle) return;
        this.bStartDrag = true;
        this.map.dragging.disable();
        this.map.off('mousemove', this.mousemoveHandler).on('mousemove', this.mousemoveHandler);
        this.map.off('mouseup', this.mouseupHandler).on('mouseup', this.mouseupHandler);
      },
    });
  };
  mousemoveHandler = e => {
    if (this.bStartDrag) {
      const radius = this.getRadius();
      this.circle.setLatLng(e.latlng);
      this.startPoint = e.latlng;
      this.endPoint = this.getEndPoint(this.startPoint, radius);
      this.addCircle();
    }
    // this.showTooltip();
  };
  mouseupHandler = e => {
    if (this.bStartDrag) {
      this.dragEndHander();
      this.map.removeEventListener('mousemove');
      this.map.dragging.enable();
      this.bStartDrag = false;
    }
  };
  getEndPoint(startPoint, radius = 1000) {
    const d = this.meter2degree(radius);
    let lng = startPoint.lng + d;
    const { lat } = startPoint;

    let dist = startPoint.distanceTo(L.latLng(lat, lng));
    while (dist > radius + 0.1) {
      lng -= 0.00001;
      dist = startPoint.distanceTo(L.latLng(lat, lng));
    }

    while (dist < radius - 0.1) {
      lng += 0.00001;
      dist = startPoint.distanceTo(L.latLng(lat, lng));
    }
    return { lat, lng };
  }
  get45Point(startPoint, endPoint, radius = 1000) {
    if (endPoint) {
      radius = startPoint.distanceTo(endPoint);
    }
    const d = this.meter2degree(radius);
    let lng = startPoint.lng + d;
    let lat = startPoint.lat + d / 11;

    let dist = startPoint.distanceTo(L.latLng(lat, lng));
    while (dist > radius + 0.1) {
      lng -= 0.00001;
      lat -= 0.00001;
      dist = startPoint.distanceTo(L.latLng(lat, lng));
    }

    while (dist < radius - 0.1) {
      lng += 0.00001;
      lat += 0.00001;
      dist = startPoint.distanceTo(L.latLng(lat, lng));
    }
    return { lat, lng };
  }
  meter2degree(dist) {
    return (dist / (6378137 * Math.PI * 2)) * 360;
  }
  degree2meter(dist) {
    return (dist * 6378137 * Math.PI * 2) / 360;
  }
  addTooltip() {
    const tooltip = L.tooltip({
      direction: 'right',
      permanent: true,
      interactive: true,
      noWrap: true,
      opacity: 0.9,
      offset: [5, 0],
    });
    const lnglat = this.get45Point(this.startPoint, this.endPoint, 1000);
    tooltip.setContent('取消');
    tooltip.setLatLng(new L.LatLng(lnglat.lat, lnglat.lng));
    tooltip.addTo(this.map);

    const el = tooltip.getElement();
    el.addEventListener('click', () => {
      this.clear();
    });
    el.style.pointerEvents = 'auto';

    this.tooltip = tooltip;
  }
  addCancelBtn() {
    let latlng;
    if (this.draggable) {
      const rst = this.get45Point(this.startPoint, this.endPoint, 1000);
      latlng = new L.LatLng(rst.lat, rst.lng);
    } else {
      latlng = new L.LatLng(this.endPoint.lat, this.endPoint.lng);
    }
    const icon = L.icon({
      iconUrl: require('../../../assets/images/map/cancel.png'),
      iconSize: [19.5, 19.5],
    });
    this.cancelMarker && this.map.removeLayer(this.cancelMarker);
    this.cancelMarker = L.marker(latlng, { icon, title: '清除' })
      .addTo(this.map)
      .on('click', () => {
        this.select(true);
        this.parent.savePrevent &&
          this.parent.savePrevent(this.parent.currentEditPreventType, false);
        this.clear();
        this.parent.doNotifyClearSelect();
      });
  }
  select(isClear = false) {
    if (!this.endPoint || Number(this.radiusM) < 1) {
      this.clear();
      return;
    }
    const { radius } = this;
    const { lng, lat } = this.startPoint;
    this.circle.id = this.id;
    this.parent.doCircleSelect({ lng, lat, radius, circle: this.circle, isClear });
    if (this.callback) {
      this.callback({ lng, lat, radius: this.degree2meter(radius), circle: this.circle });
    }
  }
  /**
   * 创建雷达动效
   */
  createRadarAnimate() {
    let timeout = 0;
    if (this.circle && !this.map.getBounds().contains(this.circle.getBounds())) {
      this.map.fitBounds(this.circle.getBounds());
      timeout = 500;
    }
    if (this.isShowRader) {
      setTimeout(() => {
        this.clearAnimate();
        const divIcon = L.divIcon({
          className: 'radar-circle-div',
          iconSize: null,
          html: '<canvas id="radarCanvas"/>',
        });
        this.cMarker = L.marker(this.startPoint, { icon: divIcon }).addTo(this.map);

        const radius = this.startPoint.distanceTo(this.endPoint);
        const ePoint = this.getEndPoint(this.startPoint, radius);
        const sPixel = this.map.latLngToContainerPoint(this.startPoint);
        const ePixel = this.map.latLngToContainerPoint(ePoint);
        const oPixel = L.point(
          sPixel.x - Math.abs(ePixel.x - sPixel.x),
          sPixel.y - Math.abs(ePixel.x - sPixel.x),
        );
        const nLonlat = this.map.containerPointToLatLng(oPixel);
        this.cMarker.setLatLng(nLonlat);
        const iconSize = [
          (Math.abs(ePixel.x - sPixel.x) * 2) / 5,
          (Math.abs(ePixel.x - sPixel.x) * 2) / 5,
        ];
        const options = { iconSize, animate: false, shadow: true, map: this.map };
        this.radarShodow = L.marker.pulse(this.startPoint, options).addTo(this.map);
        this.radarShodowInset = L.marker
          .pulse(this.startPoint, { inset: true, ...options })
          .addTo(this.map);
        const rCanvas = document.getElementById('radarCanvas');
        const radar = new RadarCanvas(rCanvas, this.map, Math.abs(ePixel.x - sPixel.x) * 2);
        radar.scan();
        this.radar = radar;
        this.map.on('radarZoom', this.zoomHandler.bind(this));
      }, timeout);
    }
  }
  zoomHandler = function(args) {
    // console.log('radarZomm', args);
    this.radarShodow && this.map.removeLayer(this.radarShodow);
    this.radarShodowInset && this.map.removeLayer(this.radarShodowInset);
    const iconSize = [args.width / 5, args.height / 5];
    const options = { iconSize, animate: false, shadow: true, map: this.map };
    this.radarShodow = L.marker.pulse(this.startPoint, options).addTo(this.map);
    this.radarShodowInset = L.marker
      .pulse(this.startPoint, { inset: true, ...options })
      .addTo(this.map);
  };
  /**
   * 清除雷达动效
   */
  clearAnimate() {
    this.radar && this.radar.clear();
    this.cMarker && this.map.removeLayer(this.cMarker);
  }
  /**
   * 调整地图范围，看得清楚整个圆
   */
  fitBounds() {
    this.map.fitBounds(this.circle.getBounds());
  }
  /**
   * 绘制一个逐渐放大的圆
   * @param latLng 圆心坐标
   * @param radius 半径
   */
  drawAnimateCircle(latLng, radius) {
    let i = 0;
    const me = this;
    const options = { color: '#2950B8', fillColor: 'none', dashArray: 6, weight: 2 };
    while (i < 20) {
      (_i => {
        // eslint-disable-line no-loop-func
        const t = setTimeout(() => {
          me.animateCircle && me.map.removeLayer(me.animateCircle);
          me.animateCircle = L.circle(latLng, (radius * (_i + 1)) / 20, options).addTo(me.map);
          // console.log(_i)
        }, 50 * (_i + 1));
        me.timerList.push(t);
      })(i);
      i++;
    }
  }
  clearAnimateCircle() {
    this.timerList.map(t => clearTimeout(t));
    this.animateCircle && this.map.removeLayer(this.animateCircle);
  }
}

export default CircleSelect;
