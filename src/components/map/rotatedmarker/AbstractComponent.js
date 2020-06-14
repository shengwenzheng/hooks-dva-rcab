import { MapLayer } from 'react-leaflet';
import 'leaflet-rotatedmarker';

class WrapClass {
  constructor(LeafletComponent, position, options) {
    return new LeafletComponent(position, options);
  }
}
export default class AbstractComponent extends MapLayer {
  createLeafletElement({ position, leaflet, ...options }) {
    return new WrapClass(this.leafletComponent, position, options);
  }

  updateLeafletElement(fromProps, { rotationAngle, rotationOrigin }) {
    if (fromProps.rotationAngle !== rotationAngle) {
      this.leafletElement.setRotationAngle(rotationAngle);
    }
    if (fromProps.rotationOrigin !== rotationOrigin) {
      this.leafletElement.setRotationOrigin(rotationOrigin);
    }
  }

  get leafletComponent() {
    throw new Error('leafletComponent getter not implemented');
  }
}

