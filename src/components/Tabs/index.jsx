import React, { useState } from 'react';
import styles from './index.scss';

function Tabs(props) {
  const { children } = props;
  const [key, setKey] = useState('0');

  const renderHeader = () => {
    return React.Children.map(children, element => {
      const {
        key: tabKey,
        props: { title, image, imageActive, onTabClick, children: subChildren },
      } = element;
      let active = false;
      if (subChildren) active = tabKey === key;
      return (
        <div
          className={styles.tab}
          onClick={() => {
            if (subChildren) setKey(tabKey);
            onTabClick && onTabClick();
          }}
        >
          <img src={active ? imageActive : image} alt="icon" />
          <span className={active ? styles.active : null}>{title}</span>
        </div>
      );
    });
  };

  const renderContent = () => {
    return React.Children.map(children, element => (
      <div style={element.key === key ? null : { display: 'none' }}>{element.props.children}</div>
    ));
  };

  return (
    <div>
      <div className={styles.titleContainer}>{renderHeader()}</div>
      <div className={styles.contentContainer}>{renderContent()}</div>
    </div>
  );
}

export default Tabs;
