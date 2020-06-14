import React, { useEffect } from 'react';
import { addMask } from 'g-mask';
import { connect } from 'dva';
import Header from './Header';
import styles from './index.scss';

function Index(props) {
  const { children, dispatch, userInfo } = props;

  useEffect(() => {
    dispatch({ type: 'deploy/getUserInfo' });
  }, [dispatch]);

  useEffect(() => {
    const { disPlayName = '' } = userInfo;
    addMask([disPlayName, '{date}', '192.168.0.1']);
  }, [userInfo]);

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
}

export default connect(({ deploy: { userInfo } }) => ({ userInfo }))(Index);
