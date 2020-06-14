export function getPixelFromMeter(map, meter) {
  var centerLatLng = map.getCenter(); // get map center
  var pointC = map.latLngToContainerPoint(centerLatLng); // convert to containerpoint (pixels)
  var pointX = [pointC.x + 1, pointC.y]; // add one pixel to x
  var pointY = [pointC.x, pointC.y + 1]; // add one pixel to y

  // convert containerpoints to latlng's
  var latLngC = map.containerPointToLatLng(pointC);
  var latLngX = map.containerPointToLatLng(pointX);
  var latLngY = map.containerPointToLatLng(pointY);

  var distanceX = latLngC.distanceTo(latLngX); // calculate distance between c and x (latitude)
  var distanceY = latLngC.distanceTo(latLngY); // calculate distance between c and y (longitude)
  return meter / distanceX;
}
/**
 * 判定经纬度是否在杭州附近
 */
export function isValidLatLng({ lat, lng }) {
  lat = Number(lat);
  lng = Number(lng);
  return lat > 29 && lat < 31 && lng > 118 && lng < 121;
}
