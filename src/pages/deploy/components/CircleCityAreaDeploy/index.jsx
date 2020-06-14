import React from 'react';
import { connect } from 'dva';
import { Icon, Tag, Modal, message } from 'antd';
import Tabs from '@/components/Tabs';
import CameraMonitor from './CameraMonitor';
import ControlObject from './ControlObject';
import Police from './Police';
import PoliceDeploy from './PoliceDeploy';
import peopleImg from '@/assets/images/people.png';
import peopleActiveImg from '@/assets/images/people-active.png';
import videoImg from '@/assets/images/video.png';
import videoActiveImg from '@/assets/images/video-active.png';
import policeImg from '@/assets/images/police.png';
import policeActiveImg from '@/assets/images/police-active.png';
import manageImg from '@/assets/images/manag.png';
import manageActiveImg from '@/assets/images/manag-active.png';
import styles from './index.scss';

const { confirm } = Modal;

function CircleCityAreaDeploy(props) {
  const { circleCityAreaDeployModalVisible, isControlTopicEdit, dispatch } = props;

  const closeAreaDeployModal = () => {
    if (isControlTopicEdit) {
      confirm({
        title: '布控对象正在配置,是否退出?',
        okText: '退出',
        cancelText: '取消',
        onOk() {
          dispatch({ type: 'deploy/resetForm' });
          message.info('布控对象未保存！');
        },
        onCancel() {},
      });
    } else {
      dispatch({ type: 'deploy/resetForm' });
    }
  };

  const goBasicDeployModal = () => {
    dispatch({
      type: 'deploy/save',
      payload: { circleCityBasicDeployModalVisible: true, circleCityAreaDeployModalVisible: false },
    });
  };

  if (!circleCityAreaDeployModalVisible) return null;
  return (
    <div className={styles.areaDeployContainer}>
      <div className={styles.header}>
        <span>环城圈-关联配置</span>
        <Icon type="close" className={styles.closeIcon} onClick={closeAreaDeployModal} />
      </div>
      <div className={styles.content}>
        <p className={styles.title}>
          <span>红旗街检查站</span>
          <Icon type="edit" className={styles.editIcon} onClick={goBasicDeployModal} />
        </p>
        <Tag color="#FF1E00" className={styles.tag}>
          环城圈/检查站
        </Tag>
        <p className={styles.text}>经度:23.23232</p>
        <p className={styles.text}>纬度:23.23232</p>
        <div className={styles.keyPriod}>
          <p>负责人:&nbsp;</p>
          <ul>
            <li>王大伟/13758399999</li>
            <li>西湖区西湖派出所</li>
          </ul>
        </div>

        <Tabs>
          <div title="布控对象" image={peopleImg} imageActive={peopleActiveImg} key="0">
            <ControlObject />
          </div>
          <div title="监控" image={videoImg} imageActive={videoActiveImg} key="1">
            <CameraMonitor />
          </div>
          <div title="警力" image={policeImg} imageActive={policeActiveImg} key="2">
            <Police />
          </div>
          <div title="警力配置" image={manageImg} imageActive={manageActiveImg} key="3">
            <PoliceDeploy />
          </div>
        </Tabs>
      </div>
    </div>
  );
}

export default connect(({ deploy: { circleCityAreaDeployModalVisible, isControlTopicEdit } }) => ({
  circleCityAreaDeployModalVisible,
  isControlTopicEdit,
}))(CircleCityAreaDeploy);
