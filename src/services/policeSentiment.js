import request from '@/utils/request';

// let api = '/rcab/api';
let api = process.env.api;

//查询实时警情统计
export function getCount() {
  return request.get(api + '/alarm/query/data/count');
}
// 实时警情列表
export function getRealTime(alarmType) {
  // return request.get(`/alarm/query/data/list/${alarmType}`);
  return request(api + '/alarm/query/data/list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json;charset=utf8' },
    body: JSON.stringify(alarmType),
  });
}
// 周边监控
export function getCameraList(obj) {
  const { circleCenterLng, circleCenterLat } = obj;
  return request.get(api + `/alarm/around/camera/list/${circleCenterLng}/${circleCenterLat}`);
}
// 周边警力
export function getPoliceList(obj) {
  const { circleCenterLng, circleCenterLat } = obj;
  return request.get(api + `/alarm/around/police/list/${circleCenterLng}/${circleCenterLat}`);
}
