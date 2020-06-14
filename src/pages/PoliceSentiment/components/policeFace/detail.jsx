import React from 'react';
import { Card, Button, Badge, Icon } from 'antd';
import styles from './index.less';
import { connect } from 'dva';


function FaceDetail(props) {
  const {
    policeSentiment: { currentPoliceObj },
    dispatch,
    recoverAlarmPoliceState,
 } = props;
  return (
    <div className={styles.detaileBox}>
      <div className={styles.header}>
        <span>警情-人脸布控报警</span>
        <Icon type="close" onClick={() => {
          dispatch({
            type: 'policeSentiment/setPoliceAlarmPopupVisible',
            payload: {
              policePopupVisible: false,
            },
          });
          recoverAlarmPoliceState && recoverAlarmPoliceState();
        }} />
      </div>
      <div style={{ overflow: 'auto', padding: '0 12px' }}>
        <div className={styles.faceBox}>
          <div className={styles.img}>
            <img src={require(`@/assets/images/police-active.png`)} />
          </div>
          <ul className={styles.oul}>
            <li className={styles.oli}>
              <span>
                {currentPoliceObj.targetName}/{currentPoliceObj.targetSource}
              </span>
            </li>
            <li className={styles.oli}>
              <span>身份证号：</span>
              <div>{currentPoliceObj.targetId}</div>
            </li>
            <li className={styles.oli}>
              <span>居住地址：</span>
              <div>{'暂无字段'}</div>
            </li>
            <li className={styles.oli}>
              <span>其他字段：</span>
              <div>{'暂无字段'}</div>
            </li>
          </ul>
        </div>
        <div className={styles.centerBox}>
          <span>告警联系人：</span>
          <div>
            <div>15055503425/王某某</div>
            <div>民警/张某某</div>
          </div>
        </div>
        <div className={styles.btn}>
          <Badge count={5}>
            <Button>触网记录</Button>
          </Badge>
        </div>
        {[1, 2, 3, 4, 5].map(item => {
          return (
            <div className={styles.listChil} key={item}>
              <div className={styles.childTitle}>
                <Badge count={3} style={{ backgroundColor: '#2950B8', color: '#fff' }} />
                <span>2020-02-16 08:20:49</span>
              </div>
              <div className={styles.childTop}>
                <Badge
                  count={'3分钟控制圈'}
                  style={{ backgroundColor: '#E31CA4', color: '#fff' }}
                />
                <span>江干区某某某派出所辖区</span>
              </div>
              <div className={styles.childCenter}>
                <div className={styles.center_bottom_img}>
                  <img src={require(`@/assets/images/police-active.png`)} />
                  <p>线索图</p>
                </div>
                <div className={styles.center_bottom_text}>
                  <p>相似度</p>
                  <p>80%</p>
                </div>
                <div className={styles.center_bottom_img}>
                  <img src={require(`@/assets/images/police-active.png`)} />
                  <p>布控图</p>
                </div>
              </div>
              <div className={styles.center_buttom_text}>
                <img src={require(`@/assets/images/monitor-active.png`)} alt="" />
                <span>西湖区文化路交叉口222222222222222222222</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default connect(({ policeSentiment, map: {recoverAlarmPoliceState} }) => {
  return {
    policeSentiment,
    recoverAlarmPoliceState,
  };
})(FaceDetail);
