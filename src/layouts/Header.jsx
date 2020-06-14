import React from 'react';
import { connect } from 'dva';
import { Menu, Dropdown } from 'antd';
import styles from './Header.scss';

function Header(props) {
  const { dispatch, userInfo } = props;
  const { disPlayName = 'username' } = userInfo;

  const onMenuClick = () => {
    dispatch({ type: 'deploy/logout' });
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.left}>
        <img className={styles.logo} src="/pwaLogo.png" alt="" />
        <span className={styles.title}>警务操作系统</span>
        <span className={styles.version}>V2.0</span>
        <span className={styles.divide}>|</span>
        <span className={styles.subtitle}>135快反</span>
      </div>
      <div className={styles.right}>
        <Dropdown
          overlay={
            <Menu onClick={onMenuClick}>
              <Menu.Item>
                <span>退出</span>
              </Menu.Item>
            </Menu>
          }
          placement="bottomCenter"
        >
          <span className={styles.username}>{disPlayName}</span>
        </Dropdown>
      </div>
    </header>
  );
}

export default connect(({ deploy: { userInfo } }) => ({ userInfo }))(Header);
