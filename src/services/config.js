import request from '@/utils/request';

// let api = '/rcab/api';
let api = process.env.api;
// 岗亭
export function policebox({ action, data }) {
  return request.get(api + `/policebox/${action}`, { data });
}

// 出入口
export function passway({ action, data }) {
  return request.get(api + `/doorway/${action}`, { data });
}
// 检查站
export function tollStation({ action, data }) {
  return request.get(api + `/checkpoint/${action}`, { data });
}

// 检查站保存
export async function saveMapTollGate(params) {
  return request(api + '/checkpoint/save', {
    method: 'post',
    headers: { 'Content-Type': 'application/json;charset=utf8' },
    body: JSON.stringify(params),
  });
}
// 岗亭保存
export async function saveMapSentrybox(params) {
  return request(api + '/policebox/save', {
    method: 'post',
    headers: { 'Content-Type': 'application/json;charset=utf8' },
    body: JSON.stringify(params),
  });
}
// 出入口保存
export async function saveMapEntryAndexit(params) {
  return request(api + '/doorway/save', {
    method: 'post',
    headers: { 'Content-Type': 'application/json;charset=utf8' },
    body: JSON.stringify(params),
  });
}
export async function getDeviceCameraList() {
  return request.get(api + `/deviceCamera/list`);
}

// 岗亭
export function delPolicebox(id) {
  return request.delete(api + `/policebox/delete/${id}`);
}

// 出入口
export function delPassway(id) {
  return request.delete(api + `/doorway/delete/${id}`);
}
// 检查站
export function delTollStation(id) {
  return request.delete(api + `/checkpoint/delete/${id}`);
}

// 岗亭
export function updatePolicebox(data) {
  return request.put(api + `/policebox/update`, { data });
}

// 出入口
export function updatePassway(data) {
  return request.put(api + `/doorway/update`, { data });
}
// 检查站
export function updateTollStation(data) {
  return request.put(api + `/checkpoint/update`, { data });
}

// 直播流地址获取
export function videoPlayBacksStart(params) {
  return request.get(api + `/stream/start/${params.deviceId}`);
}
// 直播流地址关闭
export function videoPlayBacksStop(params) {
  return request.get(api + `/stream/stop/${params.deviceId}`);
}
