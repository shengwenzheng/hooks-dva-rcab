import React,{useState} from 'react';
import { connect } from 'dva';
import {Input,Button,Modal } from 'antd';
import styles from './index.scss';

const { confirm } = Modal;

function PoliceSetBox(props) {
  const { checkpointDet,subwayPolice,poi } = props;
  const data = poi ?  checkpointDet : subwayPolice;
  const policeNum = data.policeForce || data.policeForceNum;
  const [edit,setEdit] = useState(false);
  const [value,setValue] = useState('');

  const handleEdit = () =>{
    setEdit(true);
    setValue('')
  }

  const hideEdit = () =>{
    setEdit(false);
    if(value && policeNum !== value){
      showConfirm();
    }
  }

  const onChange = (e) => {
    const number = e.target.value;
    if(isNaN(number))return;
    setValue(number);
  }

  const policeSubmit = () =>{
    let syncFn = '';
    let params = null
    if(poi){
      syncFn = 'fight/reCheckpointDet';
      let obj = {
        policeForceNum: value,
        policeForceDeptName:data.policeForceDeptName
      }
      params =  Object.assign(obj,{id: data.id})
    }else{
      syncFn = 'fight/reSubwayStation';
      let obj = {
        policeForce: value,
        policeForceDepartmentName:data.policeForceDepartmentName
      }
      params = Object.assign(obj,{id: data.id})
    }
    props.dispatch({
      type: syncFn,
      payload: params,
    });
  }

  function showConfirm() {
    confirm({
      title: '警力配置已修改,是否保存?',
      okText: '保存',
      cancelText: '不保存',
      onOk() {
        policeSubmit()
      },
    });
  }
  
  return (
    <div className={styles.policeSetBox}>
      <div className={styles.edit}>
        <span>已配置警力: {policeNum}</span>
        {!edit&&<img onClick={handleEdit} src={require('@/assets/images/record_active.png')} alt="icon"/>}
      </div>
      {!edit&&<div>
        警员: {policeNum}人
      </div>}
      {edit&&<div className={styles.inputEdit}>
        <div>警员 <Input value={value} onChange={onChange}/> 人</div>
        <div>
          <Button onClick={hideEdit}>取消</Button>
          <Button type='primary' onClick={policeSubmit}>保存</Button>
        </div>
      </div>}
    </div>
  );
}

export default connect(({fight:{ checkpointDet,subwayPolice,poi }}) => ({checkpointDet,subwayPolice,poi}))(PoliceSetBox);