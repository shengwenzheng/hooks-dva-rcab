import { useState } from 'react';
import { Checkbox, Button } from 'antd';
import styles from './index.less';
import { connect } from 'dva';
function PoliceForces({ dispatch, policeList }) {
  const [checkAll, setCheckAll] = useState(false);
  const [activeNum, setActiveNum] = useState(0);
  function onCheckChange(params) {
    let num = 0;
    let newData = policeList.map(item => {
      let obj = item;
      if (item.gpsid === params.gpsid) {
        obj.checked = !obj.checked;
      }
      if (obj.checked) {
        num++;
      }
      return obj;
    });
    setActiveNum(num);
    setCheckAll(num === policeList.length);
    DisPatch(newData);
  }
  function onCheckAllChange(e) {
    setCheckAll(e.target.checked);
    let newData = policeList.map(item => {
      let obj = item;
      obj.checked = e.target.checked;
      return obj;
    });
    setActiveNum(e.target.checked ? policeList.length : 0);
    DisPatch(newData);
  }
  function DisPatch(newData) {
    dispatch({
      type: 'policeSentiment/setPoliceList',
      payload: {
        newData,
      },
    });
  }
  return (
    <div className={styles.box}>
      <div className={styles.policeBox}>
        <div className={styles.count}>当前警力数: {policeList.length}</div>
        <div className={styles.checkboxList}>
          {policeList.map(item => {
            return (
              <div key={item.gpsid} className={styles.list} onClick={() => onCheckChange(item)}>
                <Checkbox checked={item.checked}></Checkbox>
                <div>
                  <div>
                    {item.gpsName}/{item.policePhone || '暂无'}
                  </div>
                  <div>{item.policeDept}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.checkAll}>
          <Checkbox onChange={onCheckAllChange} checked={checkAll}>
            全选
          </Checkbox>
          <span>已选择{activeNum}个</span>
        </div>
      </div>
      <div className={styles.submitPolice}>
        <Button disabled>发起会议</Button>
        <Button disabled>发短信</Button>
        <Button disabled>发钉钉</Button>
        <Button disabled>增援</Button>
      </div>
    </div>
  );
}

export default connect(({ policeSentiment }) => {
  return {
    policeList: policeSentiment.policeList,
  };
})(PoliceForces);
