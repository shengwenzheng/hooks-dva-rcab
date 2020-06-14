import { getCount, getRealTime, getCameraList, getPoliceList } from '@/services/policeSentiment';
import _ from 'lodash';

export default {
  namespace: 'policeSentiment',
  state: {
    dataCount: {}, // 实时警情统计
    realTimeList: [], // 实时警情列表
    openPolicePopupFunc: null,
    videoList: [], // 周边监控
    playingList: [], // 正在播放监控列表 length <= 3
    policeList: [], // 周边警力
    policeSentimentActions: {}, // 地图的方法
    reCall: true, // 警情详情弹窗是否需要重新请求
    policePopupVisible: false, // 警情详情弹窗是否显示,
    currentPoliceObj: {}, // 当前选中警情数据对象
  },
  effects: {
    *mapActions({ payload }, { put }) {
      yield put({ type: 'save', payload: { policeSentimentActions: payload } });
    },
    //实时警情统计
    *getDataCount(_, { call, put }) {
      const { code, data } = yield call(getCount);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { dataCount: data } });
    },
    *setRealTimeList({ payload }, { put }) {
      yield put({ type: 'save', payload: { realTimeList: payload.data } });
    },
    //实时警情列表
    *getRealTimeList({ payload }, { call, put }) {
      if (payload.alarmType.length) {
        const { code, data } = yield call(getRealTime, payload);
        if (code !== 200) return;
        data.sort((a, b) => new Date(b.caseTime) - new Date(a.caseTime));
        yield put({ type: 'save', payload: { realTimeList: data } });
      } else {
        yield put({ type: 'save', payload: { realTimeList: [] } });
      }
    },
    // 地图打开详情
    *openPolicePopup({ payload }, { put }) {
      yield put({ type: 'save', payload: { openPolicePopupFunc: payload.openPolicePopup } });
    },
    // h获取周边监控
    *getvideoList({ payload }, { call, put }) {
      const { code, data } = yield call(getCameraList, payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { videoList: data } });
    },
    // 设置周边监控
    *setVideoList({ payload }, { put }) {
      yield put({ type: 'save', payload: { videoList: payload.newData } });
    },
    // 设置播放监控列表
    *setPlayingList({ payload }, { put }) {
      yield put({
        type: 'savePlayingList',
        payload: { currentCheckedVideoList: payload.currentCheckedVideoList },
      });
    },
    *getPoliceList({ payload }, { call, put }) {
      const { code, data } = yield call(getPoliceList, payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { policeList: data } });
    },
    //
    *setPoliceList({ payload }, { put }) {
      yield put({ type: 'save', payload: { policeList: payload.newData } });
    },
    // 是否重新请求弹窗内容列表【摄像头，警员列表等】
    *setPoliceDetailShouldUpdate({ payload }, { put }) {
      yield put({
        type: 'save',
        payload: { reCall: payload.reCall },
      });
    },
    // 是否打开警情详情弹窗
    *setPoliceAlarmPopupVisible({ payload }, { put }) {
      yield put({ type: 'save', payload });
    },
    *setCurrentSelectedPoliceObj({ payload }, { put }) {
      yield put({ type: 'saveCurrentPoliceObj', payload });
    },
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveCurrentPoliceObj(state, { payload }) {
      const currentPoliceObj = _.find(state.realTimeList, d => d.id === payload.id);
      return {
        ...state,
        currentPoliceObj,
      };
    },
    savePlayingList(state, { payload }) {
      const playingList = payload.currentCheckedVideoList.concat([]);
      return {
        ...state,
        playingList,
      };
    },
  },
};
