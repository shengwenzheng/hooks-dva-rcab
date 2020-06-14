import { message } from 'antd';
import { circleType as circleTypeList } from '@/utils/config';
import { isJSON, judgeCheckStatus } from '@/utils/tool';
import {
  getBranchOfficeList,
  getPoliceStationList,
  getControlCircleWithOrganizationAndNotDeploy,
  getCheckpointList,
  getPoliceboxList,
  getControlTopicList,
  getDoorwayList,
  addBasicInfo,
  updatePreplan,
  updateControl,
  getControlCircleById,
  updateBasicInfo,
  getUserInfo,
  logout,
} from '@/services/deploy';

export default {
  namespace: 'deploy',
  state: {
    userInfo: {},
    basicDeployModalVisible: false,
    areaDeployModalVisible: false,
    editModalVisible: false,
    //基本配置下拉框的列表
    branchOfficeList: [],
    policeStationList: [],
    //左侧界面135防控圈列表
    controlCircleWithOrganization: [],
    //左侧界面检查点治安岗亭
    checkpointList: [],
    policeboxList: [],
    doorwayList: [],
    //富文本编辑框内容
    editorContent: '',
    savedEditorContent: '',
    isShowEditor: true,
    //基础配置表单
    basicDeployForm: {},
    testForm: {}, //仅仅判断是否编辑过
    circleType: 1,
    //布控专题列表
    controlTopicList: [],
    checkStatus: false, //true false indeterminate
    checkedList: [],
    savedCheckedList: [],
    isOriginCheckedListEmpty: true,
    isControlTopicEdit: true,
    //正在编辑的任务的id
    id: -1,
    circleCityBasicDeployModalVisible: true,
    circleCityAreaDeployModalVisible: false,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/deploy') {
          dispatch({ type: 'getControlCircleWithOrganizationAndNotDeploy' });
          dispatch({ type: 'getCheckpointList' });
          dispatch({ type: 'getPoliceboxList' });
          dispatch({ type: 'getDoorwayList' });
          dispatch({ type: 'getControlTopicList' });
        }
      });
    },
  },
  effects: {
    *getUserInfo(_, { call, put }) {
      const { code, data } = yield call(getUserInfo);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { userInfo: data } });
    },
    *logout(_, { call, put }) {
      const { code, data, message: messageText } = yield call(logout);
      if (code !== 200) {
        message.error(messageText);
        return;
      }
      window.location.href = data;
    },
    *getBranchOfficeList(_, { call, put }) {
      const { code, data } = yield call(getBranchOfficeList);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { branchOfficeList: data } });
    },
    *getPoliceStationList({ payload }, { call, put }) {
      const { orgId } = payload;
      const { code, data } = yield call(getPoliceStationList, orgId);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { policeStationList: data } });
    },
    *getControlCircleWithOrganizationAndNotDeploy(_, { call, put }) {
      const { code, data } = yield call(getControlCircleWithOrganizationAndNotDeploy);
      if (code !== 200) return;
      yield put({ type: 'controlCircleWithOrganization', payload: { data } });
    },
    //检查点
    *getCheckpointList(_, { call, put }) {
      const { code, data } = yield call(getCheckpointList);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { checkpointList: data } });
    },
    //岗亭
    *getPoliceboxList(_, { call, put }) {
      const { code, data } = yield call(getPoliceboxList);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { policeboxList: data } });
    },
    //出入口
    *getDoorwayList(_, { call, put }) {
      const { code, data } = yield call(getDoorwayList);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { doorwayList: data } });
    },
    //获取布控专题库列表
    *getControlTopicList(_, { call, put }) {
      const { code, data } = yield call(getControlTopicList);
      if (code !== 200) return;
      yield put({
        type: 'saveControlTopicList',
        payload: { data },
        // payload: { controlTopicList: isJSON(data) ? JSON.parse(data) : data },
      });
    },
    *addPointInfo({ payload }, { call, put }) {
      const {
        code,
        message: messageText,
        data: { id },
      } = yield call(addBasicInfo, payload.data);
      if (code !== 200) {
        message.error(messageText);
        return;
      }
      message.success('点位绘制成功');
      yield put({ type: 'getControlCircleWithOrganizationAndNotDeploy' });
      return id;
    },
    //修改135防控圈基础信息
    *updateBasicInfo({ payload }, { call, put, select }) {
      const data = formatBasicDeployForm(payload.data);
      const { id } = yield select(({ deploy }) => deploy);
      const { code, message: messageText } = yield call(updateBasicInfo, { ...data, id });
      if (code !== 200) {
        message.error(messageText);
        return;
      }
      message.success(messageText);
      yield put({
        type: 'save',
        payload: {
          basicDeployForm: data,
          basicDeployModalVisible: false,
          areaDeployModalVisible: true,
        },
      });
      yield put({ type: 'getControlCircleWithOrganizationAndNotDeploy' });
    },
    //修改环城圈基础信息
    *updateCircleCityBasicInfo({ payload }, { call, put, select }) {
      yield put({
        type: 'save',
        payload: {
          circleCityBasicDeployModalVisible: false,
          circleCityAreaDeployModalVisible: true,
        },
      });
    },
    //修改135防控圈预案信息
    *updatePreplan(_, { call, select, put }) {
      const { id, editorContent } = yield select(({ deploy }) => deploy);
      yield put({ type: 'save', payload: { savedEditorContent: editorContent } });
      const { code, message: messageText } = yield call(updatePreplan, {
        id,
        preplan: editorContent,
      });
      if (code !== 200) {
        message.error(messageText);
        return;
      }
      message.success(messageText);
      yield put({
        type: 'save',
        payload: { editModalVisible: false, isShowEditor: false },
      });
    },
    //修改135防控圈布控信息
    *updateControl(_, { call, select, put }) {
      const { controlTopicList, checkedList, id } = yield select(({ deploy }) => deploy);
      // if (isOriginCheckedListEmpty && !checkedList.length) {
      //   message.error('布控对象不能为空');
      //   return;
      // }
      const data = {
        circleSpznControlTask: {
          ryztJson: JSON.stringify(
            checkedList.map(v => controlTopicList.find(obj => obj.mc === v)),
          ),
        },
        id,
      };
      const { code, message: messageText } = yield call(updateControl, data);
      if (code !== 200) {
        message.error(messageText);
        return;
      }
      message.success(messageText);
      yield put({
        type: 'save',
        payload: {
          isControlTopicEdit: false,
          isOriginCheckedListEmpty: !checkedList.length,
          savedCheckedList: checkedList,
        },
      });
    },
    //修改基础信息,弹出窗口
    *openEditModal({ payload: { id: payloadId } }, { call, put }) {
      yield put({ type: 'resetForm' });
      yield put({
        type: 'save',
        payload: { areaDeployModalVisible: true, isControlTopicEdit: false, isShowEditor: false },
      });
      const { data, code } = yield call(getControlCircleById, payloadId);
      if (code !== 200) return;
      yield put({ type: 'saveForm', payload: { data } });
      // yield put({ type: 'getPoliceStationList', payload: { orgId: data.countyCode } });
    },
    *openBasicModal({ payload }, { put, call }) {
      const { circleType, id } = payload;
      yield put({ type: 'resetForm' });
      yield call(delay, 100);
      yield put({ type: 'save', payload: { circleType, id, basicDeployModalVisible: true } });
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
        ...payload,
      };
    },
    controlCircleWithOrganization(state, { payload: { data } }) {
      const controlCircleWithOrganization = data.map(org => ({
        ...org,
        preventionsByType: circleTypeList
          .map(obj => ({
            ...obj,
            list: org.preventions.filter(prevention => prevention.type === Number(obj.key)),
          }))
          .filter(obj => obj.list.length > 0),
      }));
      return {
        ...state,
        controlCircleWithOrganization,
      };
    },
    saveControlTopicList(state, { payload: { data } }) {
      const controlTopicList = isJSON(data) ? JSON.parse(data) : data;
      const controlTopicmcList = controlTopicList.map(obj => obj.mc);
      const { checkedList } = state;
      return {
        ...state,
        controlTopicList,
        isOriginCheckedListEmpty: !checkedList.length,
        checkStatus: judgeCheckStatus(controlTopicmcList, checkedList),
      };
    },
    saveForm(state, { payload: { data } }) {
      const { id, preplan, circleSpznControlTask } = data;
      const ryztJson = circleSpznControlTask && circleSpznControlTask.ryztJson;
      const checkedList = isJSON(ryztJson) ? JSON.parse(ryztJson).map(obj => obj.mc) : [];
      return {
        ...state,
        id,
        basicDeployForm: data,
        // controlCircleData: data,
        editorContent: preplan || '',
        savedEditorContent: preplan || '',
        isShowEditor: false,
        checkedList,
        savedCheckedList: checkedList,
        isOriginCheckedListEmpty: !checkedList.length,
        isControlTopicEdit: false,
      };
    },
    resetForm(state) {
      return {
        ...state,
        basicDeployModalVisible: false,
        areaDeployModalVisible: false,
        editModalVisible: false,
        //基本配置下拉框的列表
        policeStationList: [],
        //富文本编辑框内容
        editorContent: '',
        savedEditorContent: '',
        isShowEditor: true,
        //基础配置表单
        basicDeployForm: {},
        testForm: {},
        circleType: 1,
        //布控专题列表
        checkStatus: false, //true false indeterminate
        checkedList: [],
        savedCheckedList: [],
        isOriginCheckedListEmpty: true,
        isControlTopicEdit: true,
        //正在编辑的任务的id
        id: -1,
        // controlCircleData: {},
        circleCityBasicDeployModalVisible: false,
        circleCityAreaDeployModalVisible: false,
      };
    },
  },
};

const formatBasicDeployForm = form => {
  const {
    workingDayType, //工作日类型["1"]
    crossDaySetting, //跨天设置[true]
    startTime, //开始时间[Moment]
    endTime, //结束时间[Moment]
    circleType: type, //快反圈类型"1"
    name, //名称"name"
    branchOffice: { key: countyCode, label: countyName }, //分局{key: "33010600", label: "西湖分局"}
    policeStation: { key: responsibleUnitCode, label: responsibleUnitName }, //派出所{key: "33010653", label: "北山派出所"}
    quickDisposal: rapidDisposalArea, //快速处置部位和区域"ks"
  } = form;
  const formattedStartTime = startTime.map(item => item.format('HH:mm:ss'));
  const formattedEndTime = endTime.map(item => item.format('HH:mm:ss'));
  const timePeriodJson = JSON.stringify({
    workingDayType,
    crossDaySetting,
    startTime: formattedStartTime,
    endTime: formattedEndTime,
  });
  return {
    countyCode, //分局orgId
    countyName, //分局orgName
    responsibleUnitCode, //责任单位orgId
    responsibleUnitName, //责任单位orgName
    name, //名称
    type,
    rapidDisposalArea, //快速处置部位和区域
    timePeriodJson, // 重点时间段:json字符串
  };
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
