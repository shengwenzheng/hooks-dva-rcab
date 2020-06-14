import request from '@/utils/request';

// let api = '/rcab/api';
let api = process.env.api;

//查询带组织的防控圈列表
export function getControlCircleWithOrganization() {
  return request.post(api + '/preventionControlCircle/org/list');
}
//检查站接口
export function getCheckpointList() {
  return request.get(api + '/checkpoint/list');
}
//治安岗亭接口
export function getPoliceboxList() {
  return request.get(api + '/policebox/list');
}
//出入口
export function getDoorwayList() {
  return request.get(api + '/doorway/list');
}
//出入口 详情
export function getDoorwayDet(id) {
  return request.get(api + `/doorway/detail/${id}`);
}
//出入口 周边监控
export function getDoorwayAroundCamera({ lng, lat }) {
  return request.get(api + `/doorway/around/camera/list/${lng}/${lat}`);
}
//出入口 周边警力
export function getDoorwayAroundPolice({ lng, lat }) {
  return request.get(api + `/doorway/around/police/list/${lng}/${lat}`);
}
//地铁线路
export function getSubwayRoute() {
  return request.get(api + '/subwaySecurityRoute/list/numbers');
}
//
export function getSubwayLine(type) {
  return request.get(api + `/subwaySecurityRoute/list/numbers/${type}`);
}
//地铁站点
export function getSubwayStation(id) {
  return request.get(api + `/subwaySecurityRoute/detail/${id}`);
}
//地铁站详情
export function getSubwayDet(id) {
  return request.get(api + `/subwayStation/detail/${id}`);
}
//岗亭详情
export function getPoliceboxDet(id) {
  return request.get(api + `/policebox/detail/${id}`);
}
//岗亭 周边监控
export function getPoliceboxAroundCamera({ lng, lat }) {
  return request.get(api + `/policebox/around/camera/list/${lng}/${lat}`);
}
//岗亭 周边警力
export function getPoliceboxAroundPolice({ lng, lat }) {
  return request.get(api + `/policebox/around/police/list/${lng}/${lat}`);
}
//地铁站点警力配置更新
export function reSubwayStation(data) {
  return request.put(api + '/subwayStation', { data });
}
//地铁站 周边监控
export function getSubwayStationCamera({ lng, lat }) {
  return request.get(api + `/subwayStation/around/camera/list/${lng}/${lat}`);
}
//地铁站 周边警力
export function getSubwayAroundPolice({ lng, lat }) {
  return request.get(api + `/subwayStation/around/police/list/${lng}/${lat}`);
}
//135防控圈 周边监控
export function getControlCircleAroundCamera(id) {
  return request.get(api + `/preventionControlCircle/around/camera/list/${id}`);
}
//135防控圈 周边警力
export function get135AroundPolice(id) {
  return request.get(api + `/preventionControlCircle/around/police/list/${id}`);
}
//检查站详情
export function getCheckpointDet(id) {
  return request.get(api + `/checkpoint/detail/${id}`);
}
//检查站 周边监控
export function getCheckpointCamera({ lng, lat }) {
  return request.get(api + `/checkpoint/around/camera/list/${lng}/${lat}`);
}
//检查站 周边警力
export function getCheckpointPolice({ lng, lat }) {
  return request.get(api + `/checkpoint/around/police/list/${lng}/${lat}`);
}
//检查站警力更新
export function reCheckpointDet(data) {
  return request.put(api + '/checkpoint/update', { data });
}
// 警力
export function getPoliceList() {
  return request.get(api + '/police/layer/data/list');
}

// 警情
export function getPoliceAlarmList() {
  return request.get(api + '/alarm/layer/data/list');
}

// 圈选统计
export function countBaseInfoByCircle({ lat, lng, radius }) {
  return request.get(api + `/baseInfoStat/circle/${lng}/${lat}/${radius}`);
}

// 框选统计
export function countBaseInfoByRectangle({ left, right, top, bottom }) {
  return request.get(api + `/baseInfoStat/rect/${left}/${right}/${bottom}/${top}`);
}

// 环城圈布控更新
export function reCircleControl(data) {
  return request.put(api + '/circleSpznControlTask/update/spznControl', { data });
}

// 地铁站布控
export function getDictList() {
  return request.post(api + '/circleSpznControlTask/special/dict');
}
