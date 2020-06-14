const { L } = window;

var RectangleSelect = {
  startPoint: null,
  endPoint: null,
  rectangle: null,
  tips: null,
  layer: L.layerGroup(),
  color: '#0D82D7',
  map: null,
  parent: null,
  clickCount: 0,
  cancelMarker: null, // X 标记点
  shape: {},
  dragMarker: null, // 拖动marker
  callback: null,

  init(me) {
    this.map = me.map;
    this.parent = me;
  },
  addRectangle: function() {
    this.destory();
    var bounds = [];
    bounds.push(this.startPoint);
    bounds.push(this.endPoint);
    this.rectangle = L.rectangle(bounds, {
      color: this.color,
      weight: 1,
    }).addTo(this.layer);
    this.layer.addTo(this.map);
  },
  /**
   * 打开冒泡窗口
   */
  openPopup: function() {
    this.rectangle
      .bindTooltip("<div style='color:white;padding:10px;' onClick=''><b>点击我保存</b></div>", {
        permanent: true,
        interactive: true,
        direction: 'top',
      })
      .openPopup();
    const that = this;
    this.rectangle
      .getTooltip()
      .getElement()
      .addEventListener('click', () => {
        that.parent.saveSelectedResult(that.shape);
        that.rectangle.clear();
      });
  },
  close: function() {},
  clear: function() {
    this.layer.clearLayers();
    this.cancelMarker && this.map.removeLayer(this.cancelMarker);
    this.dragMarker && this.map.removeLayer(this.dragMarker);
  },
  mousedown: function(e) {
    RectangleSelect.clickCount++;
    console.log('mouse down');
    RectangleSelect.tips = null;
    RectangleSelect.map.dragging.disable();
    if (RectangleSelect.clickCount == 1) {
      RectangleSelect.rectangle = null;
      RectangleSelect.startPoint = e.latlng;
    }
    RectangleSelect.map
      .on('mousemove', RectangleSelect.mousemove)
      .on('mouseup', RectangleSelect.mouseup);
  },
  mousemove: function(e) {
    // if (!RectangleSelect.startPoint) return;
    RectangleSelect.endPoint = e.latlng;
    RectangleSelect.addRectangle();
    console.log('mouse move');
  },
  mouseup: function(e) {
    if (1 < 2 || RectangleSelect.endPoint) {
      console.log('mouse up');
      RectangleSelect.close();
      RectangleSelect.map.dragging.enable();
      RectangleSelect.map
        .off('mousemove', RectangleSelect.mousemove)
        .off('mouseup', RectangleSelect.mouseup)
        .off('mousedown', RectangleSelect.mousedown);
      RectangleSelect.select();
    } else {
      console.log('mouse move register');
      RectangleSelect.map.on('mousemove', RectangleSelect.mousemove);
    }
  },
  destory: function() {
    if (this.rectangle) this.layer.removeLayer(this.rectangle);
    if (this.tips) this.layer.removeLayer(this.tips);
    // RectangleSelect.startPoint = null;
    // RectangleSelect.endPoint = null;
  },
  select() {
    if (!this.startPoint || !this.endPoint) return;
    var left = this.startPoint.lng < this.endPoint.lng ? this.startPoint.lng : this.endPoint.lng;
    var right = this.startPoint.lng > this.endPoint.lng ? this.startPoint.lng : this.endPoint.lng;
    var top = this.startPoint.lat > this.endPoint.lat ? this.startPoint.lat : this.endPoint.lat;
    var bottom = this.startPoint.lat < this.endPoint.lat ? this.startPoint.lat : this.endPoint.lat;
    // 传给后台的数据，框选查询
    var points = [
      [bottom, left],
      [bottom, right],
      [top, right],
      [top, left],
    ];
    this.addCancelBtn([top, right]);
    this.addDraggedBtn([bottom, right]);
    this.shape = { left, right, top, bottom };
    if (this.callback) {
      this.callback({
        left,
        bottom,
        top,
        right,
        rectangle: this.rectangle,
      });
    }
  },
  addCancelBtn(latlng) {
    if (this.cancelMarker) {
      this.map.removeLayer(this.cancelMarker);
    }
    var icon = L.icon({
      iconUrl: require('../../../assets/images/map/cancel.png'),
      iconSize: [18, 18],
    });
    this.cancelMarker = L.marker(latlng, { icon, title: '清除' })
      .addTo(this.map)
      .on('click', () => this.clear());
  },
  addDraggedBtn(latlng) {
    if (this.dragMarker) {
      this.map.removeLayer(this.dragMarker);
    }
    var icon = L.icon({
      iconUrl: require('../../../assets/images/map/dragMarker.png'),
      iconSize: [19, 19],
    });
    this.dragMarker = L.marker(latlng, {
      icon,
      title: '拖动矩形',
      draggable: true,
    })
      .addTo(this.map)
      .on('dragend', this.mouseup)
      .on('drag', e => {
        this.mousemove({ latlng: e.target.getLatLng() });
        this.cancelMarker && this.map.removeLayer(this.cancelMarker);
      });
  },
};

export default RectangleSelect;
