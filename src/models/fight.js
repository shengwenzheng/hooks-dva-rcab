import { isJSON } from '@/utils/tool';
import { message } from 'antd';
import {
  getControlCircleWithOrganization,
  getCheckpointList,
  getPoliceboxList,
  getSubwayRoute,
  getSubwayLine,
  getSubwayStation,
  getDoorwayList,
  getSubwayDet,
  reSubwayStation,
  getCheckpointDet,
  reCheckpointDet,
  getControlCircleAroundCamera,
  get135AroundPolice,
  getSubwayStationCamera,
  getCheckpointCamera,
  getCheckpointPolice,
  getSubwayAroundPolice,
  getPoliceboxDet,
  getPoliceboxAroundCamera,
  getPoliceboxAroundPolice,
  getDoorwayDet,
  getDoorwayAroundCamera,
  getDoorwayAroundPolice,
  getDictList,
  reCircleControl
} from '@/services/fight';
import _ from 'lodash';

export default {
  namespace: 'fight',
  state: {
    //左侧界面135防控圈列表
    controlCircleWithOrganization: [],
    //左侧界面检查点治安岗亭
    checkpointList: [],
    policeboxList: [],
    //富文本编辑框内容
    editorContent: '',
    //基础配置表单
    basicDeployForm: {},
    subwayRouteList: [],
    subwayStationList: [],
    doorwayList: [],
    subwayPolice: null,
    subwayStationCamera: [],
    checkpointDet: null,
    policeboxDet: null,
    camera135: [],
    police135: [],
    subwayDictList: [],
    modal135ChangeFn: null,
    subwayModalFn: null,
    checkPointFn: null,
    modal135Visible: false,
    subwayModalVisible: false,
    checkpointVisible: false,
    poi: null,
    id: '',
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname }) => {
        if (pathname === '/fight/135' || '/fight/alarm') {
          dispatch({ type: 'getControlCircleWithOrganization' });
          dispatch({ type: 'getCheckpointList' });
          dispatch({ type: 'getPoliceboxList' });
          dispatch({ type: 'getSubwayRoute' });
          dispatch({ type: 'getDoorwayList' });
          dispatch({ type: 'getDictList' });
        }
      });
    },
  },
  effects: {
    *getControlCircleWithOrganization(_, { call, put }) {
      const { code, data } = yield call(getControlCircleWithOrganization);
      if (code !== 200) return;
      yield put({ type: 'saveControlCircle', payload: { data } });
    },
    *getCheckpointList(_, { call, put }) {
      const { code, data } = yield call(getCheckpointList);
      if (code !== 200) return;
      yield put({ type: 'saveCheckpointList', payload: { data } });
    },
    *getPoliceboxList(_, { call, put }) {
      const { code, data } = yield call(getPoliceboxList);
      if (code !== 200) return;
      yield put({ type: 'savePoliceboxList', payload: { data } });
    },
    *getDoorwayList(_, { call, put }) {
      const { code, data } = yield call(getDoorwayList);
      if (code !== 200) return;
      yield put({ type: 'saveDoorwayList', payload: { data } });
    },
    *getSubwayRoute(_, { call, put }) {
      const { code, data } = yield call(getSubwayRoute);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { subwayRouteList: data } });
      for(let i of data){
        yield put({
          type:'getSubwayLine',
          payload:{type:i.type}
        })
      }
    },
    *getSubwayLine({payload}, { call, put }) {
      const { code, data } = yield call(getSubwayLine,payload.type);
      if (code !== 200) return;
      for(let i of data){
        yield put({
          type:'getSubwayStation',
          payload:{id:i.id}
        })
      }
    },
    *getSubwayStation({payload}, { call, put }) {
      const { code, data } = yield call(getSubwayStation,payload.id);
      if (code !== 200) return;
      yield put({ type: 'saveSubwayStation', payload: { data } });
    },
    *getSubwayDet({payload}, { call, put }) {
      const { code, data } = yield call(getSubwayDet,payload.id);
      if (code !== 200) return;
      yield put({
        type: 'save',
        payload: {
          subwayPolice: data,
          poi: null
        }
      });
      yield put({
        type:'getSubwayStationCamera',
        payload: {
          lng: data.longitude,
          lat: data.latitude
        }
      })
      yield put({
        type:'getSubwayAroundPolice',
        payload: {
          lng: data.longitude,
          lat: data.latitude
        }
      })
    },
    *reSubwayStation({payload}, { call, put }) {
      const { code, data } = yield call(reSubwayStation,payload);
      if (code !== 200) return;
      message.success('修改成功!');
      yield put({
        type:'getSubwayDet',
        payload: {id: payload.id}
      })
    },
    *getSubwayAroundPolice({payload}, { call, put }) {
      const { code, data } = yield call(getSubwayAroundPolice,payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { police135: data } });
    },
    *getCheckpointDet({payload}, { call, put }) {
      const { code, data } = yield call(getCheckpointDet,payload.id);
      if (code !== 200) return;
      yield put({
        type: 'save',
        payload: {
          checkpointDet: data,
          subwayPolice: null
        }
      });
      yield put({
        type:'getCheckpointCamera',
        payload: {
          lng: data.coordinate.split(',')[0],
          lat: data.coordinate.split(',')[1]
        }
      });
      yield put({
        type:'getCheckpointPolice',
        payload: {
          lng: data.coordinate.split(',')[0],
          lat: data.coordinate.split(',')[1]
        }
      });
    },
    *getPoliceboxAroundCamera({payload}, { call, put }) {
      const { code, data } = yield call(getPoliceboxAroundCamera,payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { camera135: data } });
    },
    *getPoliceboxAroundPolice({payload}, { call, put }) {
      const { code, data } = yield call(getPoliceboxAroundPolice,payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { police135: data } });
    },
    *getPoliceboxDet({payload}, { call, put }) {
      const { code, data } = yield call(getPoliceboxDet,payload.id);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { checkpointDet: data,subwayPolice: null } });
      yield put({
        type:'getPoliceboxAroundCamera',
        payload: {
          lng: data.coordinate.split(',')[0],
          lat: data.coordinate.split(',')[1]
        }
      });
      yield put({
        type:'getPoliceboxAroundPolice',
        payload: {
          lng: data.coordinate.split(',')[0],
          lat: data.coordinate.split(',')[1]
        }
      });
    },
    *getDoorwayAroundCamera({payload}, { call, put }) {
      const { code, data } = yield call(getDoorwayAroundCamera,payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { camera135: data } });
    },
    *getDoorwayAroundPolice({payload}, { call, put }) {
      const { code, data } = yield call(getDoorwayAroundPolice,payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { police135: data } });
    },
    *getDoorwayDet({payload}, { call, put }) {
      const { code, data } = yield call(getDoorwayDet,payload.id);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { checkpointDet: data,subwayPolice: null } });
      yield put({
        type:'getDoorwayAroundCamera',
        payload: {
          lng: data.coordinate.split(',')[0],
          lat: data.coordinate.split(',')[1]
        }
      });
      yield put({
        type:'getDoorwayAroundPolice',
        payload: {
          lng: data.coordinate.split(',')[0],
          lat: data.coordinate.split(',')[1]
        }
      });
    },
    *getSubwayStationCamera({payload}, { call, put }) {
      const { code, data } = yield call(getSubwayStationCamera,payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { camera135: data } });
    },
    *reCheckpointDet({payload}, { call, put }) {
      const { code, data } = yield call(reCheckpointDet,payload);
      if (code !== 200) return;
      message.success('修改成功!');
      yield put({
        type:'getCheckpointDet',
        payload: {id: payload.id}
      });
    },
    *getCheckpointCamera({payload}, { call, put }) {
      const { code, data } = yield call(getCheckpointCamera,payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { camera135: data } });
    },
    *getCheckpointPolice({payload}, { call, put }) {
      const { code, data } = yield call(getCheckpointPolice,payload);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { police135: data } });
    },
    *getControlCircleAroundCamera({payload}, { call, put }) {
      const { code, data } = yield call(getControlCircleAroundCamera,payload.id);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { camera135: data } });
    },
    *get135AroundPolice({payload}, { call, put }) {
      const { code, data } = yield call(get135AroundPolice,payload.id);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { police135: data } });
    },
    *reCircleControl({payload}, { call, put }) {
      const { id,type } = payload;
      const { code, data } = yield call(reCircleControl,payload);
      if (code !== 200) return;
      if(type === 1){
        yield put({
          type: 'getDoorwayDet',
          payload: { id }
        });
      }else if(type === 2){
        yield put({
          type: 'getPoliceboxDet',
          payload: { id }
        });
      }else if(type === 3){
        yield put({
          type: 'getCheckpointDet',
          payload: { id }
        });
      }
    },
    *playVideo({payload}, { call, put,select }) {
      const {mapAction} = yield select(state => state.map);
      yield call(mapAction.openVideoPopupFn,payload);
    },
    *getDictList(_, { call, put }) {
      const { code, data } = yield call(getDictList);
      if (code !== 200) return;
      yield put({ type: 'save', payload: { subwayDictList: isJSON(data)? JSON.parse(data) : data } });
    },
    *modal135ChangeFn({payload}, { call, put }) {
      const {show, fn,data} = payload;
      yield put({
        type: 'save',
        payload: {
          poi: data,
          modal135Visible: show,
          modal135ChangeFn: fn,
          subwayModalVisible: false,
          checkpointVisible: false
        },
      });
      yield put({
        type: 'getControlCircleAroundCamera',
        payload: { id: data.id }
      });
      yield put({
        type: 'get135AroundPolice',
        payload: { id: data.id }
      });
    },
    *subwayModalFn({payload}, { call, put }) {
      const {show, fn,id} = payload;
      yield put({
        type: 'save',
        payload: {
          subwayModalVisible: show,
          subwayModalFn: fn,
          modal135Visible: false,
          checkpointVisible: false
        },
      });
      if(id){
        yield put({
          type: 'getSubwayDet',
          payload: { id }
        });
      }
    },
    *checkPointFn({payload}, { call, put }) {
      const {show, fn,data} = payload;
      yield put({
        type: 'save',
        payload: {
          poi: data,
          checkpointVisible: show,
          checkPointFn: fn,
          subwayModalVisible: false,
          modal135Visible: false
        },
      });
      if(data.type === 1){
        yield put({
          type: 'getDoorwayDet',
          payload: { id: data.id }
        });
      }else if(data.type === 2){
        yield put({
          type: 'getPoliceboxDet',
          payload: { id: data.id }
        });
      }else if(data.type === 3){
        yield put({
          type: 'getCheckpointDet',
          payload: { id: data.id }
        });
      }
    },
    *cleanAllPopup({payload}, { call, put }) {
      yield put({
        type: 'modal135ChangeFn',
        payload: {
          modal135Visible: false,
          subwayModalVisible: false,
          checkpointVisible: false,
        },
      });
      yield put({
        type: 'policeSentiment/setPoliceAlarmPopupVisible',
        payload: {
          policePopupVisible: false
        },
      });
    }
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    saveSubwayStation(state, { payload }) {
      const subwayStationList = _.uniqBy(state.subwayStationList.concat([payload.data]),'id');
      return {
        ...state,
        ...payload,
        subwayStationList
      };
    },
    saveCheckpointList(state, { payload }) {
      let { data } = payload;
      data.forEach(value => {
        value['type'] = 3;
      })
      const checkpointList = data.filter(value => value.title);
      return {
        ...state,
        ...payload,
        checkpointList
      };
    },
    savePoliceboxList(state, { payload }) {
      let { data } = payload;
      data.forEach(value => {
        value['type'] = 2;
      })
      const policeboxList = data.filter(value => value.title);
      return {
        ...state,
        ...payload,
        policeboxList
      };
    },
    saveDoorwayList(state, { payload }) {
      let { data } = payload;
      data.forEach(value => {
        value['type'] = 1;
      })
      const doorwayList = data.filter(value => value.kakouName);
      return {
        ...state,
        ...payload,
        doorwayList
      };
    },
    saveControlCircle(state, { payload }) {
      const controlCircleWithOrganization = payload.data;
      if(controlCircleWithOrganization){
        controlCircleWithOrganization.forEach(value => {
          value['children'] = [{
            type: 1,
            name: '1分钟处置圈',
            list:[]
          },{
            type: 3,
            name: '3分钟控制圈',
            list:[]
          },{
            type: 5,
            name: '5分钟控制圈',
            list:[]
          }];
          if(value.preventions){
            value.preventions.forEach(val => {
              value.children.forEach(v => {
                if(v.type === val.type){
                  v.list.push(val)
                }
              })
            })
          }
        })
      }
      return {
        ...state,
        ...payload,
        controlCircleWithOrganization
      };
    },
  },
};
