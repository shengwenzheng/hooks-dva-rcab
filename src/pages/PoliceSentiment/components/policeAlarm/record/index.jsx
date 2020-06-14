import React, {useState} from 'react';
import styles from './index.less';
import { connect } from 'dva';
import { Button, message, Checkbox } from 'antd';

function Record(props) {
  const { locationPolice, policeList, longitude, latitude} = props;
  const lists = policeList.map((d) => d && d.gpsid);
  const [checkAll, changeCheckAll] = useState(false);
  const [checkedList, updateCheckedList] = useState([]);
  
  function policeListClick(item) {
    let newData = policeList.map(d => {
      d.active = d.gpsid === item.gpsid;
      return d;
    });
    locationPolice(item);

    props.dispatch({
      type: 'policeSentiment/setPoliceList',
      payload: {
        newData,
      },
    });
  }
  function onUnableClick() {
    message.warning('功能待开发');
  }
  function onCheckAllChange(e) {
    changeCheckAll(e.target.checked);
    updateCheckedList(e.target.checked ? lists : []);
  };

  function onChange(list) {
    updateCheckedList(list);
    changeCheckAll(list.length === policeList.length);
  };
  return (
    <div className={styles.record}>
      <div className={styles.content}>
        <div className={styles.header}>
          <span>当前警力数：</span>
          <span>{policeList.length}</span>
        </div>
        <ul className={styles.oul}>
          <Checkbox.Group style={{ width: '100%' }} onChange={onChange} value={checkedList} >
            {policeList.map(item => {
              const { gpsName, interphoneno, policePhone, policeDept, gpsid } = item;
              return (
                <li
                  key={gpsid}
                  onClick={() => policeListClick(item)}
                  className={item.active ? styles.activeOli : null}
                >
                  <Checkbox value={gpsid}>
                    <img src={require(`@/assets/images/police-active.png`)} />
                    {gpsName}/{policePhone}
                    <div className={styles.dpt}>{policeDept}</div>
                  </Checkbox>
                </li>
              );
            })}
          </Checkbox.Group>
        </ul>
        <div className={styles.checkAll}>
          <Checkbox
              onChange={onCheckAllChange}
              checked={checkAll}
            >
              全选
            </Checkbox>
            <span>已选择{checkedList.length}个</span>
        </div>
      </div>
      <div className={styles.footer}>
          <Button onClick={() => onUnableClick()}>
            发起会议
          </Button>
          <Button onClick={() => onUnableClick()}>
            发短信
          </Button>
          <Button onClick={() => onUnableClick()}>
            发钉钉
          </Button>
          <Button onClick={() => onUnableClick()}>
            增援
          </Button>
        </div>
    </div>
  );
}
export default connect(obj => {
  const { policeSentiment, map } = obj;
  return {
    policeList: policeSentiment.policeList,
    locationPolice: map.locationPolice,
  };
})(Record);
