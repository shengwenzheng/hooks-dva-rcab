/* eslint-disable default-case */
/* eslint-disable require-yield */
import {
  policebox,
  passway,
  tollStation,
  saveMapTollGate,
  saveMapSentrybox,
  saveMapEntryAndexit,
  getDeviceCameraList,
  delPolicebox,
  delPassway,
  delTollStation,
  updatePolicebox,
  updatePassway,
  updateTollStation,
  videoPlayBacksStart,
  videoPlayBacksStop
} from '@/services/config';
import {
  getPoliceAlarmList,
  getPoliceList,
  countBaseInfoByCircle,
  countBaseInfoByRectangle,
} from '@/services/fight';
import { updateSelection, deleteSelection } from '@/services/deploy';

export default {
  namespace: 'map',
  state: {
    mapAction: {},
    checkPoint: {
      passway: [],
      policebox: [],
      tollStation: [],
    },
    deviceCameraList: [],
    locationCheckPoint: null,
    locationPoliceAlarm: null,
    locationPolice: null,
    locationPreventCircle: null,
    locationSubway: null,
    policeList: [],
    policeAlarmList: [],
    totalInfo: null,
    closeThePreventCircle: null,
    preventCircleNumber: 0,
    layerChecked: {
      checkPoint: true,
      preventCircle: true,
      police: false,
      policeAlarm: false,
      subway: true,
    },
    // 当前被鼠标选中的防控圈ID
    selectedPreventId: -1,
    // 当前防控圈是否处于编辑状态
    bPpreventCircleEditable: false,
    // 防控圈状态重置
    recoverState: null,
    // 环绕圈ID：检查点、出入口和岗亭
    selectedCheckPointId: -1,
    // 选中警力ID
    selectedPoliceId: -1,
    // 选中警情ID
    selectedPoliceAlarmId: -1,
    // 环绕圈重置
    recoverCheckState: null,
    // 警情重置
    recoverAlarmPoliceState: null,
    // 警力重置
    recoverPoliceState: () => {},
    // 地铁站重置
    recoverSubwayState: null,
  },
  effects: {
     // 点播某个时间段播放地址
     *videoPlayBacksStart({ payload }, { put, call }) {
      const res = yield call(videoPlayBacksStart, payload);
      return res;
    },
    // 关闭某个时间段播放地址
    *videoPlayBacksStop({ payload }, { put, call }) {
      const res = yield call(videoPlayBacksStop, payload);
      return res;
    },
    *mapAction({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: {
          mapAction: payload,
        },
      });
    },
    *savePoi({ payload }, { put, call }) {
      const { type, action } = payload;
      let interfaceName = '';
      switch (type) {
        case 1:
          interfaceName = passway;
          break;
        case 2:
          interfaceName = policebox;
          break;
        case 3:
          interfaceName = tollStation;
          break;
      }

      let { code, data } = yield call(interfaceName, payload);
      if (action === 'list' && code === 200) {
        data.map(item => {
          item.type = type;
          item.name = item.kakouName || item.title;
        });
        data = data.filter(item => item.coordinate);
        yield put({
          type: 'saveCheckPoint',
          payload: {
            checkPoint: {
              type: interfaceName.name,
              data,
            },
          },
        });
      }
    },
    // 检查站接口
    *mapTollGate({ payload }, { put, call }) {
      const res = yield call(saveMapTollGate, payload);
      return res;
    },
    // 岗亭接口
    *mapSentrybox({ payload }, { put, call }) {
      const res = yield call(saveMapSentrybox, payload);
      return res;
    },
    // 出入口接口
    *mapEntryAndexit({ payload }, { put, call }) {
      const res = yield call(saveMapEntryAndexit, payload);
      return res;
    },
    *getDeviceCameraList({ payload }, { put, call }) {
      const res = yield call(getDeviceCameraList, payload);
      const { code, data } = res;
      if (code === 200) {
        yield put({
          type: 'save',
          payload: {
            deviceCameraList: data,
          },
        });
      }
    },
    *locationCheckPoint({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          locationCheckPoint: payload.locationCheckPoint,
        },
      });
    },
    *locationPoliceAlarm({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          locationPoliceAlarm: payload.locationPoliceAlarm,
        },
      });
    },
    *locationPolice({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          locationPolice: payload.locationPolice,
        },
      });
    },
    *locationPreventCircle({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          locationPreventCircle: payload.locationPreventCircle,
        },
      });
    },
    *locationSubway({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          locationSubway: payload.locationSubway,
        },
      });
    },
    *getPoliceList({ payload }, { put, call }) {
      const { code, data } = yield call(getPoliceList);
      if (code === 200) {
        yield put({
          type: 'save',
          payload: {
            policeList: data,
          },
        });
      }
    },
    *getPoliceAlarmList({ payload }, { put, call }) {
      const { code, data } = yield call(getPoliceAlarmList);
      if (code === 200) {
        yield put({
          type: 'save',
          payload: {
            policeAlarmList: data,
          },
        });
      }
    },
    *countBaseInfoByCircle({ payload }, { put, call }) {
      const { code, data } = yield call(countBaseInfoByCircle, payload);
      if (code === 200) {
        yield put({
          type: 'save',
          payload: {
            totalInfo: data,
          },
        });
        return data;
      }
    },
    *countBaseInfoByRectangle({ payload }, { put, call }) {
      const { code, data } = yield call(countBaseInfoByRectangle, payload);
      if (code === 200) {
        yield put({
          type: 'save',
          payload: {
            totalInfo: data,
          },
        });
        return data;
      }
    },
    *updatePreventCircle({ payload }, { put, call }) {
      return yield call(updateSelection, payload);
    },
    *deletePreventCircle({ payload }, { put, call }) {
      return yield call(deleteSelection, payload);
    },
    *delPolicebox({ payload }, { put, call }){
      return yield call(delPolicebox, payload);
    },
    *delPassway({ payload }, { put, call }){
      return yield call(delPassway, payload);
    },
    *delTollStation({ payload }, { put, call }){
      return yield call(delTollStation, payload);
    },
    *updatePolicebox({ payload }, { put, call }){
      return yield call(updatePolicebox, payload);
    },
    *updatePassway({ payload }, { put, call }){
      return yield call(updatePassway, payload);
    },
    *updateTollStation({ payload }, { put, call }){
      return yield call(updateTollStation, payload);
    },
    *setLayerChecked({ payload }, { put, call }) {
      yield put({
        type: 'saveLayerChecked',
        payload: {
          layerChecked: payload,
        },
      });
    },
    *closeThePreventCircle({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          closeThePreventCircle: payload.closeThePreventCircle,
       },
      });
    },
    *setPreventCircleNumber({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          preventCircleNumber: payload.preventCircleNumber,
        },
      });
    },
    *setSelectedPreventId({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          selectedPreventId: payload.selectedPreventId,
        },
      });
    },
    *setBPpreventCircleEditable({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          bPpreventCircleEditable: payload.bPpreventCircleEditable,
        },
      });
    },
    *setSelectedCheckPointId({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          selectedCheckPointId: payload.selectedCheckPointId,
        },
      });
    },
    *setSelectedPoliceId({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          selectedPoliceId: payload.selectedPoliceId,
        },
      });
    },
    *setSelectedPoliceAlarmId({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          selectedPoliceAlarmId: payload.selectedPoliceAlarmId,
        },
      });
    },
    *recoverState({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          recoverState: payload.recoverState,
        },
      });
    },
    *recoverCheckState({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          recoverCheckState: payload.recoverCheckState,
        },
      });
    },
    *recoverAlarmPoliceState({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          recoverAlarmPoliceState: payload.recoverAlarmPoliceState,
        },
      });
    },
    *recoverPoliceState({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          recoverPoliceState: payload.recoverPoliceState,
        },
      });
    },
    *recoverSubwayState({ payload }, { put, call }) {
      yield put({
        type: 'save',
        payload: {
          recoverSubwayState: payload.recoverSubwayState,
        },
      });
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveCheckPoint(state, { payload }) {
      const { type, data } = payload.checkPoint;
      const tmp = state;
      tmp.checkPoint = JSON.parse(JSON.stringify(state.checkPoint));
      tmp.checkPoint[type] = data;
      return {
        ...tmp,
      };
    },
    saveLayerChecked(state, { payload }) {
      const tmp = state;
      tmp.layerChecked = JSON.parse(JSON.stringify(state.layerChecked));
      tmp.layerChecked = {
        ...tmp.layerChecked,
        ...payload.layerChecked
      };
      return {
        ...tmp,
      }
    }
  },
};
