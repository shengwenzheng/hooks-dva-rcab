/**
 * 雷达图
 * @param  {string} canvas DOM id
 * @return {object}        雷达图对象
 */
export default class RadarCanvas {
  /**
   * 构造函数
   * @param c DOM对象，canvas类型
   * @param map 地图对象
   * @returns {null}
   */
  constructor(c, map, width, height = width) {
    this.c = c;
    this.map = map; // 地图对象
    this.c.width = width;
    this.c.height = height;
    this.c.style.opacity = 0.4;
    // 未能找到该DOM对象
    if (!this.c) {
      console.log('[error] can not find canvas');
      return null;
    }
    // 引用了错误的DOM对象
    if (!this.c.getContext) {
      console.log('[error] getContext is undefined');
      return null;
    }

    this.ctx = this.c.getContext('2d');
    this.setParam();
    this.map.on('zoom', this.zoomHandler.bind(this));
    this.currentZoom = this.map.getZoom();
    this.widthHeihgt = { w: this.c.width, h: this.c.height };
  }

  setParam() {
    // 画布的宽高
    this.cWidth = this.c.width;
    this.cHeight = this.c.height;
    // 中心点
    this.centerX = this.c.width / 2;
    this.centerY = this.c.height / 2;
    // 半径
    this.radius = this.centerX * 1.0;

    this.animID = null;
    this.points = [
      [this.cWidth / 3, this.cHeight * 3 / 7],
      [this.cWidth * 4 / 5, this.cHeight * 6 / 9],
    ];
  }

  drawPoint(x, y, n) {
    this.ctx.lineWidth = 1;
    for (let i = n; i > 0; i--) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, n - i, 0, 2 * Math.PI);
      this.ctx.strokeStyle = `rgba(42,195,39,${i / n})`;
      this.ctx.stroke();
    }
  }

  drawCircle(r, lineWidth = 1, color = 'rgba(255, 255, 255, 1)') {
    this.ctx.beginPath();
    this.ctx.setLineDash([]);
    this.ctx.arc(this.centerX, this.centerY, r, 0, 2 * Math.PI);
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  drawSector(sAngle, eAngle) {
    const blob = 500;
    let increase = 0;

    if (sAngle < eAngle) {
      increase = (eAngle - sAngle) / blob;
    } else if (sAngle > eAngle) {
      increase = (Math.PI * 2 - sAngle + eAngle) / blob;
    } else {
      return;
    }

    let angle1 = sAngle;
    let angle2 = sAngle + increase;
    for (let i = 0; i < blob; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.arc(this.centerX, this.centerY, this.radius, angle1, angle2);
      this.ctx.fillStyle = `rgba(41,121,255,${i / blob})`;
      this.ctx.fill();
      angle1 = angle2;
      angle2 = angle1 + increase;
      if (angle2 >= Math.PI * 2) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.arc(this.centerX, this.centerY, this.radius, angle1, Math.PI * 2);
        this.ctx.fillStyle = `rgba(41,121,255,${i / blob})`;
        this.ctx.fill();
        angle1 = 0;
        angle2 = angle1 + increase;
      }
    }
  }

  Line(x, y, lineDash = [], color = '#0000ff', lineWidth = 1) {
    this.ctx.beginPath();
    this.ctx.setLineDash(lineDash);
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(x, y);
    this.ctx.lineWidth = lineWidth;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  init() {
    this.drawCircle(1.0 * this.centerY, 0.001);
    !this.iscliped && this.ctx.clip();
    this.iscliped = true;

    // 背景填充色
    this.ctx.fillStyle = '#e0eeff';
    this.ctx.fillOpacity = 0.5;
    this.ctx.fillRect(0, 0, this.cWidth, this.cHeight);
    for (let i = 0; i <= 8; i += 2) {
      this.Line(this.centerX + Math.sin(Math.PI * i / 4) * this.radius,
        this.centerY + Math.cos(Math.PI * i / 4) * this.radius,
        [], 'rgba(255, 255, 255, 1)', 2);
    }
    // for (let i = 1; i <= 15;) {
    //   this.Line(this.centerX + Math.sin(Math.PI * i / 8) * this.radius,
    //     this.centerY + Math.cos(Math.PI * i / 8) * this.radius,
    //     [], '#062807');
    //   i += 2;
    // }
    this.drawCircle(0.8 * this.centerY, 2);
    this.drawCircle(0.6 * this.centerY, 2);
    this.drawCircle(0.3 * this.centerY, 2);
  }

  clear() {
    cancelAnimationFrame(this.animID);// 停止动画
    this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);// 清除画布
    this.points = [[this.cWidth / 3, this.cHeight * 3 / 7], [this.cWidth * 4 / 5, this.cHeight * 6 / 9]];// 重置默认点
  }

  scan() {
    // this.drawRect();return;
    const angle = Math.PI * 2;
    let scanBegin = 0;
    let scanEnd = angle;
    let pointRadius = 1;
    // 绘制雷达扫描
    const move = () => {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.cWidth, this.cHeight);// 清除画布
      this.init();// 重绘背景
      this.drawSector(scanBegin, scanEnd);// 绘制扇形扫描区域
      for (const p of this.points) {
        this.drawPoint(p[0], p[1], pointRadius);
      }
      // 改变点的半径以及扇形的角度
      pointRadius += 0.08;
      scanBegin += angle / 100;
      scanEnd = scanBegin + angle;
      // 超过阈值变为初始值
      if (scanBegin >= Math.PI * 2) {
        scanBegin = 0;
        scanEnd = scanBegin + angle;
      }
      if (pointRadius >= 7) pointRadius = 0;
      // 再次绘制
      this.animID = window.requestAnimFrame(() => move.call(this));
    };

    window.requestAnimFrame = (function () {
      return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };
    })();

    this.animID = window.requestAnimFrame(() => move.call(this));
  }

  stopScan() {
    cancelAnimationFrame(this.animID);
  }

  addPoints(x, y) {
    this.points.push([x, y]);
  }

  zoomHandler() {
    this.iscliped = false;
    const zoomNum = this.map.getZoom();
    const scale = Math.pow(2, zoomNum - this.currentZoom);
    const width = this.widthHeihgt.w * scale;
    const height = this.widthHeihgt.h * scale;
    this.c.width = width;
    this.c.height = height;
    this.setParam();
    this.map.fire('radarZoom', { width, height });
  }
}

