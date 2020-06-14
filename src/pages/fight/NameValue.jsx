import React from 'react';
import styles from './NameValue.scss';

function NameValue(props) {
  const { name, value, unit } = props;
  return (
    <div className={styles.nameValueContainer}>
      <span className={styles.name}>{name}</span>
      <span className={styles.value}>{value}</span>
      <span className={styles.unit}>{unit}</span>
    </div>
  );
}

export default NameValue;
