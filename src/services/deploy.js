import request from '@/utils/request';

// let api = '/rcab/api';
let api = process.env.api;

// 所属分局
export function getBranchOfficeList() {
  return request.post(api + '/organization/list/county');
}
//根据分局ID获取派出所列表
export function getPoliceStationList(orgId) {
  return request.post(api + `/organization/list/station/${orgId}`);
}
//查询带组织的防控圈列表
export function getControlCircleWithOrganization() {
  return request.post(api + '/preventionControlCircle/org/list');
}
//查询带组织的和未配置的防控圈列表
export function getControlCircleWithOrganizationAndNotDeploy() {
  return request.post(api + '/preventionControlCircle/config/org/list');
}
//检查站接口
export function getCheckpointList() {
  return request.get(api + '/checkpoint/list');
}
//治安岗亭接口
export function getPoliceboxList() {
  return request.get(api + '/policebox/list');
}
//治安岗亭接口
export function getDoorwayList() {
  return request.get(api + '/doorway/list');
}
//布控专题
export function getControlTopicList() {
  return request.post(api + '/circleSpznControlTask/special/dict');
}
//添加135防控圈基础信息
export function addBasicInfo(data) {
  return request.post(api + '/preventionControlCircle/add/basic', { data });
}
//修改135防控圈基础信息
export function updateBasicInfo(data) {
  return request.put(api + '/preventionControlCircle/update/basic', { data });
}
//修改135防控圈预案信息
export function updatePreplan(data) {
  return request.put(api + '/preventionControlCircle/update/preplan', { data });
}
//修改防控圈布控信息
export function updateControl(data) {
  return request.put(api + '/preventionControlCircle/update/circleSpznControl', { data });
}
//修改防控圈信息
export function updateSelection(data) {
  return request.put(api + '/preventionControlCircle/update/selection', { data });
}
//删除防控圈
export function deleteSelection(id) {
  return request.delete(api + `/preventionControlCircle/${id}`);
}
//根据id获取防控圈基础信息
export function getControlCircleById(id) {
  return request.get(api + `/preventionControlCircle/${id}`);
}
//获取用户信息
export function getUserInfo() {
  return request.get(api + '/userInfoByAzp');
}
//退出
export function logout() {
  return request.get(api + '/logout');
}
//保存检查站
export function updateCheckpoint() {
  return request.put(api + '/checkpoint/update');
}
//保存治安岗亭
export function updatePolicebox() {
  return request.put(api + '/policebox/update');
}
//保存出入口
export function updateDoorway() {
  return request.put(api + '/doorway/update');
}
