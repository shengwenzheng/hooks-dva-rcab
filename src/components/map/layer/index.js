import GridLayer from 'react-leaflet/es/GridLayer';
import { withLeaflet } from 'react-leaflet';

const { L } = window;

L.TileLayer.PGISLayerClass = L.TileLayer.extend({
  getTileUrl(coords) {
    let e = coords.z;
    this.options.zOffset && (e += Number(this.options.zOffset));
    let i = `L${this.zeroPad(e, 2, 10)}`;
    let n = `R${this.zeroPad(coords.y, 8, 16)}`;
    let a = `C${this.zeroPad(coords.x, 8, 16)}`;
    if (this.isUpper) {
      i = i.toUpperCase();
      n = n.toUpperCase();
      a = a.toUpperCase();
    }
    return this._url.replace('{z}', i).replace('{y}', n).replace('{x}', a);
  },
  zeroPad(a, b, c) {
    for (a = a.toString(c || 10); a.length < b;) a = `0${a}`;
    return a;
  },
});

L.tileLayer.PGISLayer = function (templateUrl, options) {
  return new L.TileLayer.PGISLayerClass(templateUrl, options);
};

class _PGISTileLayer extends GridLayer {
  createLeafletElement(props) {
    return new L.tileLayer.PGISLayer(props.url, this.getOptions(props));
  }

  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    if (toProps.url !== fromProps.url) {
      this.leafletElement.setUrl(toProps.url);
    }
  }
}

export const PGISTileLayer = withLeaflet(_PGISTileLayer);

