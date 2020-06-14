import React from 'react';
import { connect } from 'dva';
import { circleType as circleTypeList, workingDayType as workingDayTypeList } from '@/utils/config';
import { isJSON } from '@/utils/tool';
import { Icon, Tag, Modal, message } from 'antd';
import AreaButton from '@/components/AreaButton';
import Tabs from '@/components/Tabs';
// import CameraMonitor from './CameraMonitor';
import ControlObject from './ControlObject';
import Editor from './Editor';
import peopleImg from '@/assets/images/people.png';
import peopleActiveImg from '@/assets/images/people-active.png';
import bookImg from '@/assets/images/book.png';
import bookActiveImg from '@/assets/images/book-active.png';
// import videoImg from '@/assets/images/video.png';
// import videoActiveImg from '@/assets/images/video-active.png';
import styles from './index.scss';

const { confirm } = Modal;

function AreaDeploy(props) {
  const {
    areaDeployModalVisible,
    editModalVisible,
    basicDeployForm,
    isShowEditor,
    isControlTopicEdit,
    editorContent,
    savedEditorContent,
    mapAction: { CircleSelectFn, PolygonSelectFn },
    closeThePreventCircle,
    preventCircleNumber,
    dispatch,
  } = props;
  const {
    countyName = '', //分局orgName
    responsibleUnitName = '', //责任单位orgName
    name, //名称
    type,
    rapidDisposalArea, //快速处置部位和区域
    timePeriodJson, // 重点时间段:json字符串
  } = basicDeployForm;
  const { workingDayType = [], startTime = [], endTime = [], crossDaySetting = [] } = isJSON(
    timePeriodJson,
  )
    ? JSON.parse(timePeriodJson)
    : {};
  const circleTypeObj = circleTypeList.find(obj => Number(obj.key) === Number(type));
  const circleType = circleTypeObj ? circleTypeObj.value : '';

  const openEditModal = () => {
    dispatch({ type: 'deploy/save', payload: { editModalVisible: true } });
  };

  const handleEditModalOk = () => {
    dispatch({ type: 'deploy/updatePreplan' });
  };

  const handleEditModalCancel = () => {
    if (isShowEditor && editorContent !== savedEditorContent)
      confirm({
        title: '预案内容已修改，是否保存？',
        okText: '保存',
        cancelText: '不保存',
        onOk() {
          handleEditModalOk();
        },
        onCancel() {
          dispatch({
            type: 'deploy/save',
            payload: {
              editModalVisible: false,
              isShowEditor: false,
            },
          });
        },
      });
    else {
      message.info('未修改');
      dispatch({
        type: 'deploy/save',
        payload: { editModalVisible: false, isShowEditor: false },
      });
    }
  };

  const closeAreaDeployModal = () => {
    if (isControlTopicEdit) {
      confirm({
        title: '布控对象正在配置,是否退出?',
        okText: '退出',
        cancelText: '取消',
        onOk() {
          dispatch({ type: 'deploy/resetForm' });
          closeThePreventCircle && closeThePreventCircle(basicDeployForm);
          message.info('布控对象未保存！');
        },
        onCancel() {},
      });
    } else {
      dispatch({ type: 'deploy/resetForm' });
      closeThePreventCircle && closeThePreventCircle(basicDeployForm);
    }
  };

  const goBasicDeployModal = () => {
    dispatch({
      type: 'deploy/save',
      payload: { basicDeployModalVisible: true, areaDeployModalVisible: false },
    });
  };

  const goEditor = () => {
    dispatch({ type: 'deploy/save', payload: { isShowEditor: true } });
  };

  if (!areaDeployModalVisible) return null;
  return (
    <div className={styles.areaDeployContainer}>
      <div className={styles.header}>
        <span>区域配置</span>
        {/* <Icon type="edit" className={styles.editIcon} /> */}
        <Icon type="close" className={styles.closeIcon} onClick={closeAreaDeployModal} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>
          <span>{name}</span>
          <Icon type="edit" className={styles.editIcon} onClick={goBasicDeployModal} />
        </p>
        <Tag color="#FF1E00" className={styles.tag}>
          {circleType}
        </Tag>
        <p className={styles.text}>{`责任单位: ${countyName}/${responsibleUnitName}`}</p>
        <div className={styles.keyPriod}>
          <p>重点时段:&nbsp;</p>
          <ul>
            {workingDayType.map((v, index) => (
              <li key={index}>{`${
                workingDayTypeList.find(obj => Number(obj.key) === Number(v)).value
              } ${startTime[index]}-${crossDaySetting[index] ? '次日' : ''}${endTime[index]}`}</li>
            ))}
          </ul>
        </div>
        <p className={styles.disposalArea}>
          <span>处置区域:&nbsp;</span>
          <span>{rapidDisposalArea}</span>
        </p>
        <p className={styles.textWithButton}>
          <span>区域绘制:&nbsp;</span>
          <AreaButton
            image="circle"
            name="圆形"
            disable={preventCircleNumber > 2}
            onClick={() => CircleSelectFn && CircleSelectFn()}
          />
          <AreaButton
            image="polygon"
            name="多边形"
            disable={preventCircleNumber > 2}
            onClick={() => PolygonSelectFn && PolygonSelectFn()}
          />
        </p>
        <Tabs>
          <div title="布控对象" image={peopleImg} imageActive={peopleActiveImg} key="0">
            <ControlObject />
          </div>
          <div
            title="预案管理"
            image={bookImg}
            imageActive={bookActiveImg}
            key="1"
            onTabClick={openEditModal}
          />
          {/* <div title="摄像监控" image={videoImg} imageActive={videoActiveImg} key="2">
            <CameraMonitor />
          </div> */}
        </Tabs>
      </div>
      <Modal
        title={
          isShowEditor ? (
            '预案编辑'
          ) : (
            <span>
              <span>预案查看</span>
              <Icon type="edit" className={styles.editIcon} onClick={goEditor} />
            </span>
          )
        }
        visible={editModalVisible}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        okText="保存"
        width={800}
        footer={isShowEditor ? undefined : null}
        centered
      >
        <Editor />
      </Modal>
    </div>
  );
}

export default connect(
  ({
    deploy: {
      areaDeployModalVisible,
      editModalVisible,
      basicDeployForm,
      isShowEditor,
      isControlTopicEdit,
      editorContent,
      savedEditorContent,
    },
    map: { mapAction, closeThePreventCircle, preventCircleNumber },
  }) => ({
    areaDeployModalVisible,
    editModalVisible,
    basicDeployForm,
    isShowEditor,
    isControlTopicEdit,
    mapAction,
    closeThePreventCircle,
    editorContent,
    savedEditorContent,
    preventCircleNumber,
  }),
)(AreaDeploy);
