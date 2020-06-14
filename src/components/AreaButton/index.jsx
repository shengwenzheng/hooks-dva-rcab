import React, { useState } from 'react';
import classnames from 'classnames';
import styles from './index.scss';

function AreaButton(props) {
  const { image, name, disable, onClick } = props;
  const [active, setActive] = useState(false);

  const bodyClick = () => {
    setActive(false);
    document.body.removeEventListener('click', bodyClick);
  };

  const onButtonClick = () => {
    if (disable) return;
    onClick && onClick();
    setActive(true);
    document.body.addEventListener('click', bodyClick);
  };

  return (
    <span
      className={classnames(
        styles.areaButtonContainer,
        { [styles.active]: active },
        { [styles.disable]: disable },
      )}
      onClick={onButtonClick}
    >
      <img src={require(`@/assets/images/${image}.png`)} alt={image} />
      <span>{name}</span>
    </span>
  );
}

export default AreaButton;
