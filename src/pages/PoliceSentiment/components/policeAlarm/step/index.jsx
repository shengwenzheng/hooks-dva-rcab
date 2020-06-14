import React from 'react';
import styles from './index.less';
function Step(props) {
  const { openDetail } = props;
  const data = [
    { name: '分派', stauts: true },
    { name: '签收', stauts: true },
    { name: '到达', stauts: true, isCurrent: true },
    { name: '反馈', stauts: false },
    { name: '完成', stauts: false },
  ];
  return (
    <div className={styles.Step}>
      <div className={styles.text}>
        {data.map((item, index) => {
          return (
            <div
              key={item.name}
              style={{ left: `${index * (100 / 4)}%`, margin: '-10px 0 0 -8px' }}
              className={
                item.isCurrent ? styles.bgCurretn : item.stauts ? styles.bgActive : styles.bgDefault
              }
            >
              {item.name}
            </div>
          );
        })}
      </div>
      <div className={styles.line}>
        <div className={styles.activeLine} style={{ width: `${2 * (100 / 4)}%` }}></div>
        {data.map((item, index) => (
          <div
            key={item.name}
            className={
              item.isCurrent ? styles.stepNum0 : item.stauts ? styles.stepNum1 : styles.stepNum
            }
            style={{ left: `${index * (100 / 4)}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
}
export default Step;
