import React from 'react';
// import NameValue from './NameValue';
import MenuItem from './MenuItem';
import styles from './index.scss';
import Map from '@/components/map/war';

function Fight(props) {
  const {
    children,
    location: { pathname },
  } = props;
  return (
    <div className={styles.fightContainer}>
      <div className={styles.leftMenu}>
        {/* <MenuItem image="search" name="搜索" link="search" active={pathname.includes('search')} /> */}
        <MenuItem image="alarm" name="警情" link="alarm" active={pathname.includes('alarm')} />
        {/* <MenuItem image="police" name="警员" link="police" active={pathname.includes('police')} /> */}
        {/* <MenuItem
          image="monitor"
          name="监控"
          link="monitor"
          active={pathname.includes('monitor')}
        /> */}
        <MenuItem
          image="135"
          name={
            <>
              <span>135</span>快反
            </>
          }
          link="135"
          active={pathname.includes('135')}
        />
        <MenuItem image="deploy" name="前往配置页" link="/deploy" style={{ marginTop: 'auto' }} />
      </div>
      <div className={styles.right}>
        {/* <div className={styles.header}>
          <NameValue name="快反圈总数" value="66" unit="个" />
          <NameValue name="快反圈总数" value="66" unit="个" />
          <NameValue name="快反圈总数" value="66" unit="个" />
          <NameValue name="快反圈总数" value="66" unit="个" />
          <NameValue name="快反圈总数" value="66" unit="个" />
        </div> */}

        <div className={styles.content}>
          <Map />
          {children}
          </div>
      </div>
    </div>
  );
}

export default Fight;
