import { useState } from 'react';
import { connect } from 'dva';
import {Checkbox,Button} from 'antd';
import styles from './index.scss';

const CheckboxGroup = Checkbox.Group;

function PoliceBox(props) {
  let { police135 } = props;
  police135 = police135 || [];

  const [checkedList,setCheckedList] = useState([]);
  const [checkAll,setCheckAll] = useState(false);
  function onChange(list){
    setCheckedList(list)
    setCheckAll(list.length === police135.length)
  }

  function onCheckAllChange(e){
    let arr = e.target.checked ? police135.map(value => value.gpsid) : []
    setCheckedList(arr);
    setCheckAll(e.target.checked);
  }

  const policeList = (data) => {
    let nodes = [];
    data.forEach(item => {
      nodes.push({
        label: <div className={styles.policeInfo}>
          <img src={require('@/assets/images/police-active.png')} alt="icon" />
          <div>
            <p >{item.gpsName}/{item.policePhone}</p>
            <p>{item.policeDept}</p>
            <p>{item.interphoneno}</p>
          </div>
        </div>,
        value: item.gpsid
      })
    })
    return nodes;
  }
  return (
    <div>
      <div className={styles.policeBox}>
        <div>当前警力数: {police135.length}</div>
        <div className={styles.checkboxs}>
          <div className={styles.checkboxList}>
            <CheckboxGroup
              options={policeList(police135)}
              value={checkedList}
              onChange={onChange}
            />
          </div>
          <div className={styles.checkAll}>
            <Checkbox
            onChange={onCheckAllChange}
            checked={checkAll}
            >全选</Checkbox>
            <span>已选择{checkedList.length}个</span>
          </div>
        </div>
      </div>
      <div className={styles.submitPolice}>
        <Button type="primary" size='small'>发送消息</Button>
        <Button type="primary" size='small'>请求增援</Button>
      </div>
    </div>
  );
}

export default connect(({fight:{ police135 }}) => ({ police135 }))(PoliceBox);
