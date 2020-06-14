import React from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Tree, Button, Modal } from 'antd';
import { isBasicDeployEdit } from '@/utils/tool';
import Folder from './Folder';
import squareImg from '@/assets/images/square.png';
import styles from './index.scss';

const { TreeNode, DirectoryTree } = Tree;
const { confirm } = Modal;

function Menu(props) {
  const {
    controlCircleWithOrganization,
    checkpointList,
    policeboxList,
    doorwayList,
    locationCheckPoint,
    locationPreventCircle,
    testForm,
    areaDeployModalVisible,
    isShowEditor,
    isControlTopicEdit,
    dispatch,
  } = props;

  const controlCircleWithOrganizationTotal = controlCircleWithOrganization.reduce(
    (acc, cur) => acc + cur.preventions.length,
    0,
  );

  let key = 1;

  const renderTreeNodes = list => {
    if (!list || !list.length) return null; //优化
    return list.map(item => (
      <TreeNode title={`${item.orgName}(${item.preventions.length})`} key={item.orgId}>
        {renderPreventionsByTypeTreeNodes(item.preventionsByType, item.orgId)}
      </TreeNode>
    ));
  };

  const renderPreventionsByTypeTreeNodes = (list, orgId) => {
    if (!list || !list.length) return null;
    return list.map(item => (
      <TreeNode title={`${item.value}(${item.list.length})`} key={orgId + item.key}>
        {renderListTreeNodes(item.list, orgId + item.key)}
      </TreeNode>
    ));
  };

  const renderListTreeNodes = (list, id) => {
    if (!list || !list.length) return null;
    return list.map(item => (
      <TreeNode
        data={item}
        title={item.name || `新建快反圈${(Array(5).join(0) + key++).slice(-5)}`}
        key={id + item.id}
      />
    ));
  };

  const renderCheckpointTreeNodes = (list, type, name, key) => {
    if (!list) return null;
    return list.map(item => (
      <TreeNode
        title={item[type] || `${name}${(Array(5).join(0) + key++).slice(-5)}`}
        data={item}
        key={item.id}
      />
    ));
  };

  const goFight = () => {
    router.push('/fight/135');
  };

  const onTreeSelect = (key, e) => {
    const data = e.selectedNodes[0].props.data;
    if (data) locationCheckPoint && locationCheckPoint(data);
  };

  const on135TreeSelect = (key, e) => {
    const data = e.selectedNodes[0].props.data;
    if (data) {
      const { id, name, type } = data;
      if (
        isBasicDeployEdit(testForm) ||
        (areaDeployModalVisible && (isShowEditor || isControlTopicEdit))
      ) {
        confirm({
          title: '您当前正在编辑,是否退出?',
          okText: '退出',
          cancelText: '取消',
          onOk: () => {
            openModal(name, id, type, data);
          },
        });
      } else {
        openModal(name, id, type, data);
      }
    }
  };

  const openModal = (name, id, circleType, data) => {
    locationPreventCircle && locationPreventCircle(data);
    if (name) {
      dispatch({
        type: 'deploy/openEditModal',
        payload: { id },
      });
    } else {
      dispatch({
        type: 'deploy/openBasicModal',
        payload: { id, circleType },
      });
    }
  };

  return (
    <div className={styles.menuContainer}>
      <div className={styles.header}>
        <img src={squareImg} alt="squareImg" />
        <span>区域场所</span>
      </div>
      <div className={styles.content}>
        <Folder name="135快反圈" total={controlCircleWithOrganizationTotal} />
        <DirectoryTree showIcon={false} onSelect={on135TreeSelect}>
          {renderTreeNodes(controlCircleWithOrganization)}
        </DirectoryTree>
        <Folder
          name="环城圈"
          total={checkpointList.length + policeboxList.length + doorwayList.length}
        />
        <DirectoryTree showIcon={false} onSelect={onTreeSelect}>
          <TreeNode title={`检查站(${checkpointList.length})`} key="a">
            {renderCheckpointTreeNodes(checkpointList, 'title', '新建检查站', 1)}
          </TreeNode>
          <TreeNode title={`岗亭(${policeboxList.length})`} key="b">
            {renderCheckpointTreeNodes(policeboxList, 'title', '新建岗亭', 1)}
          </TreeNode>
          <TreeNode title={`出入口(${doorwayList.length})`} key="c">
            {renderCheckpointTreeNodes(doorwayList, 'kakouName', '新建出入口', 1)}
          </TreeNode>
        </DirectoryTree>
      </div>
      <div className={styles.footer}>
        <Button type="primary" onClick={goFight}>
          前往作战页
        </Button>
      </div>
    </div>
  );
}

export default connect(
  ({
    deploy: {
      controlCircleWithOrganization,
      checkpointList,
      policeboxList,
      doorwayList,
      testForm,
      areaDeployModalVisible,
      isShowEditor,
      isControlTopicEdit,
    },
    map: { locationCheckPoint, locationPreventCircle },
  }) => ({
    controlCircleWithOrganization,
    checkpointList,
    policeboxList,
    doorwayList,
    locationCheckPoint,
    locationPreventCircle,
    testForm,
    areaDeployModalVisible,
    isShowEditor,
    isControlTopicEdit,
  }),
)(Menu);
