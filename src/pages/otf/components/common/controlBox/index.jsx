import { useState } from 'react';
import { connect } from 'dva';
import { isJSON } from '@/utils/tool';
import { Checkbox,Button,Modal } from 'antd';
import styles from './index.scss';

const CheckboxGroup = Checkbox.Group;
const { confirm } = Modal;

function ControlBox(props) {
  const {subwayDictList,subwayPolice,dispatch,poi,checkpointDet} = props;
  let controlList = [];
  const controlCircleType = [{
    value: 3,
    name: '检查点'
  },{
    value: 1,
    name: '出入口'
  },{
    value: 2,
    name: '岗亭'
  }]; 
  let params = null;
  let syncFn = '';
  let jsonArr = [];
  let options = [];

  const [edit,setEdit] = useState(false);
  const [checkAll,setCheckAll] = useState(false);
  
  if(subwayPolice){
    options = (subwayPolice.syncType && subwayPolice.syncType !== '10010') ? subwayPolice.syncType.split(',').map(value => {
      return {
        value,
        name: value + '号线'
      }
    }) : [];
    controlList = subwayPolice.subwayStationWay.split(',').map(value => {
      return {
        value,
        name: value + '号线'
      }
    })
    syncFn = 'fight/reSubwayStation';
    params = {
      id: subwayPolice.id,
    }
    jsonArr = isJSON(subwayPolice.ryztJson) ? JSON.parse(subwayPolice.ryztJson):[];
  }else if(poi){
    options = controlCircleType.filter(value => checkpointDet.syncType.includes(value.value));
    controlList = controlCircleType;
    syncFn = 'fight/reCircleControl';
    params = {
      id: poi.id,
      type: poi.type
    }
    jsonArr = isJSON(checkpointDet.ryztJson) ? JSON.parse(checkpointDet.ryztJson):[];
  }

  const [subwayLine,setSubwayLine] = useState(controlList.map(value => value.value));
  const [checkedList = jsonArr.map(value => value.mc),setCheckedList] = useState();

  function onChange(checkedList){
    setCheckedList(checkedList);
    setCheckAll(checkedList.length === subwayDictList.length);
  };

  function onCheckAllChange(e) {
    const arr = e.target.checked ? subwayDictList.map(value => value.mc) : [];
    setCheckedList(arr);
    setCheckAll(e.target.checked);
  };

  function onChangeLine(list){
    setSubwayLine(list);
  }

  const dictList = (data) => {
    let nodes = [];
    data.forEach(item => {
      nodes.push({
        label: <span>{item.mc || item.name}</span>,
        value: item.mc || item.value
      })
    })
    return nodes;
  }

  const editCancel = () => {
    setEdit(false);
    let isChange = false;
    if(checkedList.length !== jsonArr.length){
      isChange = true
    }else{
      if(!checkedList.length && !jsonArr.length){
        isChange = false;
        return;
      };
      jsonArr.forEach(value => {
        if(!checkedList.includes(value.mc)){
          isChange = true
        }
      })
    }
    if(isChange){
      showConfirm();
    }
  }

  const submitDict = () => {
    let checkedListParmas = [];
    let syncType = poi ? subwayLine + '' : subwayLine.length > 0 ? subwayLine + '' : '10010';
    checkedList.forEach(value => {
      let mc = value.mc || value;
      subwayDictList.forEach(val => {
        if(mc === val.mc){
          checkedListParmas.push(val)
        }
      })
    })
    params = Object.assign(params,{ryztJson: JSON.stringify(checkedListParmas),syncType});
    dispatch({
      type: syncFn,
      payload: params
    });
    setEdit(false)
  }

  function showConfirm(){
    confirm({
      title: '布控对象已修改,是否保存?',
      okText: '保存',
      cancelText: '不保存',
      onOk() {
        submitDict();
      }
    });
  }
  return (
    <div className={styles.controlBox}>
      {!edit&&<div className={styles.header}>
        <span>已选择布控对象库: {jsonArr.length}</span>
        <img onClick={() => setEdit(true)} src={require('@/assets/images/record_active.png')} alt="icon" />
      </div>}
      {edit&&<div className={styles.header}>
        <span>已选择布控对象库: {checkedList.length}</span>
      </div>}
      {!edit&&<ul>
        {
          jsonArr.map(value => <li key={value.mc}>
            {value.mc}
          </li>)
        }
      </ul>}
      {edit && <div className={styles.checkBoxSty}>
        <div className={styles.checkboxList}>
          <CheckboxGroup
            options={dictList(subwayDictList)}
            value={checkedList}
            onChange={onChange}
          />
        </div>
        <div className={styles.checkAll}>
          <Checkbox
            onChange={onCheckAllChange}
            checked={checkAll}>
            全选
          </Checkbox>
          已选择{checkedList.length}个
        </div>
      </div>}
      <div className={styles.footer}>
        {!edit && !!options.length && <div className={styles.editNormal}>布控同步: {options.map(value => value.name + ', ')}</div>}
        {edit && <div className={styles.editActive}>
          <div className={styles.edit}>
            <span>布控同步:</span>
            <CheckboxGroup
            options={dictList(controlList)}
            defaultValue={controlList.map(value => value.value)}
            onChange={onChangeLine}
            />
          </div>
          <div className={styles.submitBtns}>
            <Button onClick={editCancel} size='small'>取消</Button>
            <Button type="primary" size='small' onClick={submitDict}>保存</Button>
          </div>
        </div>}
      </div>
    </div> 
    
  );
}

export default connect(({fight:{ subwayDictList,subwayPolice,poi,checkpointDet}}) => ({ subwayDictList,subwayPolice,poi,checkpointDet }))(ControlBox);