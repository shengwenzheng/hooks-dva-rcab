/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import { connect } from 'dva';
import { judgeCheckStatus } from '@/utils/tool.js';
import { Checkbox, Button, Icon, message } from 'antd';
import styles from './ControlObject.scss';

const CheckboxGroup = Checkbox.Group;

function ControlObject(props) {
  const {
    dispatch,
    controlTopicList,
    checkStatus,
    checkedList,
    isControlTopicEdit,
    savedCheckedList,
  } = props;
  const controlTopicmcList = controlTopicList.map(obj => obj.mc);

  const onCheckChange = checkedList => {
    dispatch({
      type: 'deploy/save',
      payload: {
        checkedList,
        checkStatus: judgeCheckStatus(controlTopicmcList, checkedList),
      },
    });
  };

  const onCheckAllChange = e => {
    const checked = e.target.checked;
    dispatch({
      type: 'deploy/save',
      payload: { checkedList: checked ? controlTopicmcList : [], checkStatus: checked },
    });
  };

  const updateControl = () => {
    dispatch({ type: 'deploy/updateControl' });
  };

  const cancleEditControl = () => {
    message.info('未修改');
    dispatch({
      type: 'deploy/save',
      payload: {
        isControlTopicEdit: false,
        checkedList: savedCheckedList,
        checkStatus: judgeCheckStatus(controlTopicmcList, savedCheckedList),
      },
    });
  };

  const goControlTopicEdit = () => {
    dispatch({ type: 'deploy/save', payload: { isControlTopicEdit: true } });
  };

  return (
    <div className={styles.controlObjectContainer}>
      <p className={styles.title}>
        <span>
          已选布控对象库:{isControlTopicEdit ? checkedList.length : savedCheckedList.length}
        </span>
        <Icon
          type="edit"
          className={styles.editIcon}
          style={isControlTopicEdit ? { display: 'none' } : null}
          onClick={goControlTopicEdit}
        />
      </p>
      <div style={isControlTopicEdit ? null : { display: 'none' }}>
        <Checkbox
          indeterminate={checkStatus === 'indeterminate'}
          onChange={onCheckAllChange}
          checked={checkStatus === 'indeterminate' ? false : checkStatus}
        >
          全选
        </Checkbox>
        <CheckboxGroup options={controlTopicmcList} value={checkedList} onChange={onCheckChange} />
        <div className={styles.footer}>
          <Button className={styles.cancleButton} size="small" onClick={cancleEditControl}>
            取消
          </Button>
          <Button type="primary" size="small" onClick={updateControl}>
            保存
          </Button>
        </div>
      </div>
      <ul style={isControlTopicEdit ? { display: 'none' } : null}>
        {savedCheckedList.map(v => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  );
}

export default connect(
  ({
    deploy: { controlTopicList, checkStatus, checkedList, savedCheckedList, isControlTopicEdit },
  }) => ({
    controlTopicList,
    checkStatus,
    checkedList,
    savedCheckedList,
    isControlTopicEdit,
  }),
)(ControlObject);
