import L from 'leaflet';
import AbstractComponent from './AbstractComponent';

export default class RotatedMarker extends AbstractComponent {
  get leafletComponent() {
    return L.Marker;
  }
}
