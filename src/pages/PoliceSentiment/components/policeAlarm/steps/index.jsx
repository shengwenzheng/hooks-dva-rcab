import { Steps } from 'antd';
import React from 'react';
import styles from './index.less';
const { Step } = Steps;
const data = [
  {
    time: '',
    name: '',
    id: 1,
  },
  {
    time: '',
    name: '',
    id: 2,
  },
  {
    time: '',
    name: '',
    id: 3,
  },
  {
    time: '22小时15分30秒',
    name: '历时',
    id: 4,
  },
  {
    time: '22小时15分30秒',
    name: '历时',
    id: 5,
  },
];
class Stackedcolumn extends React.Component {
  render() {
    return (
      <div className={styles.box}>
        <div className={styles.right}>
          {data.map(item => (
            <div key={item.id}>
              <div>
                <b style={{ display: 'block' }}>{item.name}</b>
                <span>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
        <Steps current={1} direction={'vertical'} style={{ width: '10px' }} progressDot>
          <Step
            title="已反馈"
            description={
              <div>
                <span></span>
              </div>
            }
          />
          <Step
            title="已反馈"
            description={
              <div>
                <span></span>
              </div>
            }
          />
          <Step
            title="未到达"
            description={
              <div>
                <span>2019-02-03</span>
              </div>
            }
          />
          <Step
            title="未签收"
            description={
              <div>
                <span>2019-02-02</span>
              </div>
            }
          />
          <Step
            title="未分派"
            description={
              <div>
                <span>2019-02-01</span>
              </div>
            }
          />
        </Steps>
      </div>
    );
  }
}
export default Stackedcolumn;
