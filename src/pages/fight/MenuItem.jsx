import React from 'react';
import Link from 'umi/link';
import styles from './MenuItem.scss';
import { connect } from 'dva';

function MenuItem(props) {
  const { name, image, active, link, style, dispatch } = props;
  const onClick = () => {
    // 切换路由清除所有弹窗
    dispatch({
      type: 'fight/cleanAllPopup',
      payload: {},
    })
  }
  return (
    <Link to={link} className={styles.menuItemContainer} style={style} onClick={onClick}>
      {active ? <div /> : null}
      <img src={require(`@/assets/images/${active ? `${image}-active` : image}.png`)} alt="icon" />
      <span className={active ? styles.active : null}>{name}</span>
    </Link>
  );
}

export default connect()(MenuItem);
