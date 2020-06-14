/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'dva';
import Menu from './components/Menu';
import BasicDeploy from './components/BasicDeploy';
import AreaDeploy from './components/AreaDeploy';
import CircleCityBasicDeploy from './components/CircleCityBasicDeploy';
import CircleCityAreaDeploy from './components/CircleCityAreaDeploy';
import SKMap from '@/components/map/index';
import styles from './index.scss';

function Deploy(props) {
  const { dispatch, basicDeployModalVisible, circleCityBasicDeployModalVisible } = props;
  useEffect(() => {
    return () => {
      dispatch({ type: 'deploy/resetForm' });
    };
  }, []);
  return (
    <div className={styles.deployContainer}>
      <Menu />
      <div className={styles.right}>
        {basicDeployModalVisible && <BasicDeploy />}
        {/* {circleCityBasicDeployModalVisible && <CircleCityBasicDeploy />} */}
        <AreaDeploy />
        <CircleCityAreaDeploy />
        <SKMap />
      </div>
    </div>
  );
}

export default connect(
  ({ deploy: { basicDeployModalVisible, circleCityBasicDeployModalVisible } }) => ({
    basicDeployModalVisible,
    circleCityBasicDeployModalVisible,
  }),
)(Deploy);
