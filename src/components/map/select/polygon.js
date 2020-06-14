import { deleteMarkeImg } from '@/components/map/constant';
import circle from '@turf/circle';
import * as turf from '@turf/helpers';
import booleanWithin from '@turf/boolean-within';
/**
 * 多边形选择
 */
const { L } = window;

export class PolygonSelect {
  constructor() {
    Object.assign(this, {
      points: [],
      lines: L.polyline([]),
      tempLines: L.polyline([], { dashArray: 5 }),
      polygon: null,
      redPtArr: [],
      tooltip: null,
      cancelMarker: null,
      id: null,
      bShowTooltip: false,
      bStartDrag: false,
    });
  }

  init(me) {
    this.parent = me;
    this.map = me.mapRef.current.contextValue.map;
  }

  start() {
    this.id = 'polygon_' + new Date().getTime();
    this.map.on('click', this.onClick); // 点击地图
    this.map.on('dblclick', this.onDoubleClick);
    this.map.on('mousemove', this.onMove); // 双击地图
    this.map.doubleClickZoom.disable(); // 禁用map双击事件
  }

  stop() {
    this.map.off('click', this.onClick); // 点击地图
    this.map.off('dblclick', this.onDoubleClick);
    this.map.off('mousemove', this.onMove); // 双击地图
  }

  clear() {
    this.stop();
    this.polygon && this.map.removeLayer(this.polygon);
    this.polygon = null;
    this.redPtArr.map(item => this.map.removeLayer(item));
    this.redPtArr = [];
    this.tooltip && this.tooltip.remove();
    this.cancelMarker && this.map.removeLayer(this.cancelMarker);
    this.cancelMarker = null;

    this.map.removeLayer(this.tempLines);
    this.tempLines.remove();
    this.lines.remove();
    this.tempLines.remove();
    this.lines = L.polyline([]);
    this.points = [];
  }

  // map.off(....) 关闭该事件
  onClick = e => {
    const redPt = L.circle(e.latlng, 1, { color: '#ff0000', fillColor: 'ff0000', fillOpacity: 1 });
    this.points.push([e.latlng.lat, e.latlng.lng]);
    this.lines.addLatLng(e.latlng);
    this.map.addLayer(this.tempLines);
    this.map.addLayer(this.lines);
    this.map.addLayer(redPt);
    this.redPtArr.push(redPt);
  };

  onMove = e => {
    if (this.points.length > 0) {
      const ls = [
        this.points[this.points.length - 1],
        [e.latlng.lat, e.latlng.lng],
        this.points[0],
      ];
      this.tempLines.setLatLngs(ls);
      // map.addLayer(tempLines)
    }
  };

  onDoubleClick = (bSave = true) => {
    this.addCancelBtn(new L.LatLng(...this.getCancelBtnPos()));
    const len = this.points.length;
    const lastPt = this.points[len - 1];
    const preLastPt = this.points[len - 2];
    if (lastPt.toString() === preLastPt.toString()) {
      this.points = this.points.slice(0, len - 1);
    }
    this.polygon = new L.Polygon.PolylineEditor(this.points, {
      maxMarkers: 100,
      dragEndHander: () => this.onDragEnd(),
      setMapState: flag => this.setMapState(flag),
    }).addTo(this.map);
    // this.polygon = L.polygon(this.points, { color: "#2950B8", dashArray: 5 }).addTo(this.map);
    // this.polygon.on('click', () => {
    //   // this.tooltip.addTo(this.map);
    //   // this.setClickEvent(this.tooltip);
    // });
    this.select();
    this.pointsBak = [...this.points];
    // 清除辅助图形
    this.points = [];
    this.map.removeLayer(this.tempLines);
    this.tempLines.remove();
    this.lines.remove();
    this.tempLines.remove();
    this.lines = L.polyline([]);
    this.stop();
    this.map.doubleClickZoom.enable(); // 禁用map双击事件
    this.map.fitBounds(this.polygon.getBounds());
    if (bSave) {
      this.parent.savePrevent(this.parent.currentEditPreventType, false);
      this.setMapState(false);
    }
  };

  onDragEnd = () => {
    this.setTooltip();
    const points = [];
    this.polygon._getMarkerLatLngs().forEach(item => points.push([item.lat, item.lng]));
    this.points = points;
    const latlng = this.getCancelBtnPos();
    this.cancelMarker.setLatLng(latlng);
    this.select();
    this.parent.savePrevent(this.parent.currentEditPreventType, false);
    setTimeout(() => this.setMapState(false), 200);
  };

  setTooltip = () => {
    if (this.bShowTooltip) {
      this.tooltip && this.map.removeLayer(this.tooltip);
      const { preventCircleMap, currentEditPreventId } = this.parent;
      const map = preventCircleMap.get(currentEditPreventId);
      map && map.eachLayer(item => item._icon && item.closePopup());
      const tooltip = L.tooltip({
        direction: 'top',
        permanent: true,
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
      const points = [...this.polygon._getMarkerLatLngs()];
      const latlng = points.sort((a, b) => b.lat - a.lat)[0];
      tooltip.setLatLng(latlng);
      tooltip.addTo(this.map);
      this.setClickEvent(tooltip);
      this.tooltip = tooltip;
    }
  };
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
        this.polygon.typeObj = { value, text };
      }
      this.select();
      this.parent.savePrevent(this.parent.currentEditPreventType, false);
      this.hideTooltip();
      // this.parent.bSavePrevent = false;
    }
    // this.map.removeLayer(this.tooltip);
  };
  hideTooltip() {
    this.tooltip && this.map.removeLayer(this.tooltip);
  }

  /**
   * 获取取消按钮的位置
   * @returns {number[]}
   */
  getCancelBtnPos() {
    const len = this.points.length;
    const lPoint = this.points[len - 2];
    const prePoint = this.points[len - 3];
    const lPixel = this.map.latLngToContainerPoint(lPoint);
    const prePixel = this.map.latLngToContainerPoint(prePoint);
    const pixLen = Math.sqrt(
      Math.pow(lPixel.x - prePixel.x, 2) + Math.pow(lPixel.y - prePixel.y, 2),
    );
    const latDr = lPoint[0] - (lPoint[0] - prePoint[0]) / (pixLen / 20);
    const lngDr = lPoint[1] - (lPoint[1] - prePoint[1]) / (pixLen / 20);
    return [latDr, lngDr];
  }

  addCancelBtn(latlng) {
    const icon = L.icon({
      iconUrl: require('../../../assets/images/map/cancel.png'),
      iconSize: [18, 18],
    });
    this.cancelMarker && this.map.removeLayer(this.cancelMarker);
    this.cancelMarker = L.marker(latlng, { icon, title: '清除' })
      .addTo(this.map)
      .on('click', () => {
        this.select(true);
        this.parent.savePrevent(this.parent.currentEditPreventType, false);
        this.clear();
        this.parent.doNotifyClearSelect();
      });
  }

  select(isClear = false) {
    this.parent.doPolygonSelect({
      points: this.points,
      polygon: this.polygon,
      isClear,
    });
  }

  triggerDragEvent() {
    this.polygon.on({
      mousedown: e => {
        if (this.parent.bDrawCircleOrRectangle) return;
        this.bStartDrag = true;
        const startPoint = e.latlng;
        const latlngs = this.polygon.getLatLngs();
        const originMarkers = this.polygon.getPoints();
        const markersMap = new Map();
        originMarkers.forEach(item => {
          const { _leaflet_id, newPointMarker } = item;
          markersMap.set(_leaflet_id, item.getLatLng());
          markersMap.set(newPointMarker._leaflet_id, newPointMarker.getLatLng());
        });
        this.map.dragging.disable();
        this.map.on('mousemove', args => {
          const latlngsClone = JSON.parse(JSON.stringify(latlngs));
          const movingPoint = args.latlng;
          const offsetLat = movingPoint.lat - startPoint.lat;
          const offsetLng = movingPoint.lng - startPoint.lng;
          const markers = this.polygon.getPoints();
          latlngsClone[0].map(item => {
            item.lat += offsetLat;
            item.lng += offsetLng;
          });
          markers.map(item => {
            let { lat, lng } = markersMap.get(item._leaflet_id);
            lat += offsetLat;
            lng += offsetLng;
            item.setLatLng(L.latLng(lat, lng));
            const newPointLatlng = markersMap.get(item.newPointMarker._leaflet_id);
            const y = newPointLatlng.lat + offsetLat;
            const x = newPointLatlng.lng + offsetLng;
            item.newPointMarker.setLatLng(L.latLng(y, x));
          });
          this.polygon.setLatLngs(latlngsClone);
        });
        this.map.on('mouseup', e => {
          if (this.bStartDrag) {
            this.onDragEnd();
            this.map.removeEventListener('mousemove');
            this.map.dragging.enable();
            this.bStartDrag = false;
          }
        });
        this.setMapState(true);
      },
    });
  }

  /**
   * 处理图形覆盖情况
   */
  bringbackToFront() {
    const options = { steps: 64, units: 'degrees', properties: {} };
    const key = this.parent.currentEditPreventId;
    const preventCircle = this.parent.preventCircleMap.get(key);
    if (preventCircle) {
      const layers = preventCircle.getLayers();
      const result = [];
      layers.forEach(item => {
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
      });

      result.sort((a, b) => {
        return booleanWithin(a.turf, b.turf) ? 1 : -1;
      });
      result.forEach(item => item.marker.bringToFront());
    }
  }

  setMapState(flag) {
    this.parent.bDrawCircleOrRectangle = flag;
  }
}

export default PolygonSelect;
