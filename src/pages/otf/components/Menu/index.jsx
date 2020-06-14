import React from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Tree, Button } from 'antd';
import Folder from './Folder';
import squareImg from '@/assets/images/square.png';
import styles from './index.scss';

const { TreeNode, DirectoryTree } = Tree;

function Menu(props) {
  const { controlCircleWithOrganization, checkpointList, policeboxList,subwayRouteList,subwayStationList,doorwayList,locationPreventCircle,locationCheckPoint,locationSubway,poi } = props;
  const modal135Handle = (id) => {
    props.dispatch({
      type: 'fight/modal135ChangeFn',
      payload: {
        show: true,
        data: {id}
      },
    });
    props.dispatch({
      type: 'fight/save',
      payload: { id }
    });
    locationPreventCircle({id});
  }

  const subwayHandle = (item) =>{
    locationSubway(item);
    let id = item.id;
    props.dispatch({
      type: 'fight/subwayModalFn',
      payload: {
        show: true,
        id
      },
    });
  }

  const renderTreeNodes = list => {
    if (!list) return null;
    return list.map(item => {
      return <TreeNode title={item.orgName  + '('+item.preventions.length+')'} key={item.orgId} >
        {
          item.preventions && item.preventions.length>0 && item.children.map(value => {
            if(value.list.length === 0)return;
            return <TreeNode title={value.name + '('+value.list.length+')'} key={value.type}>
              {
                value.list.map(val => {
                return <TreeNode title={<div onClick={() => modal135Handle(val.id)}>{val.name}</div>} key={val.id}></TreeNode>
                })
              }
            </TreeNode>
          })
        }
      </TreeNode>;
    });
  };

  const renderSubwayStationNodes = type => {
    return subwayStationList.map(value => {
      if(value.type === type){
        return <TreeNode title={value.subwayRouteName + "(" + value.subwayStations.length + ")"} key={value.subwayRouteCode} >
          {
            value.subwayStations.map(val => {
              return <TreeNode 
              title={<div onClick={()=>subwayHandle(val)}>{val.subwayStationName}</div>} 
              key={val.id+'-'+value.subwayRouteCode}/>
            })
          }
        </TreeNode>
      }
    })
  };

  const count = (list) => {
    let num = 0;
    list.forEach(value => {
      num += value.preventions.length;
    })
    return num;
  }

  const countSubway = (list) => {
    let num = 0;
    list.forEach(value => {
      num += value.subwayStations.length;
    })
    return num;
  }

  const checkPointHandle = (item) => {
    let id = item.id;
    let type = item.type;
    locationCheckPoint(item);
    props.dispatch({
      type: 'fight/checkPointFn',
      payload: {
        show: true,
        data:{ id,type }
      },
    });
  }

  const renderCheckpointTreeNodes = list => {
    if (!list) return null;
    return list.map(item => <TreeNode title={<div onClick={()=>checkPointHandle(item)}>{item.title}</div>} key={item.id + '-' + item.type} />);
  };
  const renderDoorWayNodes = list => {
    if (!list) return null;
    return list.map(item => <TreeNode title={<div onClick={()=>checkPointHandle(item)}>{item.kakouName}</div>} key={item.id + '-' + item.type}/>)
  };
  return (
    <div className={styles.menuContainer}>
      <div className={styles.header}>
        <img src={squareImg} alt="squareImg" />
        <span>135快反</span>
      </div>
      <div className={styles.content}>
        <Folder name="135快反圈" total={count(controlCircleWithOrganization)}/>
        <DirectoryTree showIcon={false}>
          {renderTreeNodes(controlCircleWithOrganization)}
        </DirectoryTree>
        <Folder name="环城圈" total={checkpointList.length+policeboxList.length+doorwayList.length} />
        <DirectoryTree showIcon={false}>
          <TreeNode title={`检查站(${checkpointList.length})`} key="a">
            {renderCheckpointTreeNodes(checkpointList)}
          </TreeNode>
          <TreeNode title={`岗亭(${policeboxList.length})`} key="b">
            {renderCheckpointTreeNodes(policeboxList)}
          </TreeNode>
          <TreeNode title={`出入口(${doorwayList.length})`} key="c">
            {renderDoorWayNodes(doorwayList)}
          </TreeNode>
        </DirectoryTree>
        <Folder name="地铁站" total={countSubway(subwayStationList)} />
        <DirectoryTree showIcon={false}>
          {
            subwayRouteList.map(value =>
            <TreeNode title={value.subwayRouteName + "(" + value.total + ")"} key={value.type}>
              {renderSubwayStationNodes(value.type)}
            </TreeNode>)
          }
        </DirectoryTree>
      </div>
    </div>
  );
}

export default connect(
  ({ fight: { controlCircleWithOrganization, checkpointList, policeboxList,subwayRouteList,subwayStationList,doorwayList,poi },
      map:{locationPreventCircle,locationCheckPoint,locationSubway} }) => ({
    controlCircleWithOrganization,
    checkpointList,
    policeboxList,
    subwayRouteList,
    subwayStationList,
    doorwayList,
    poi,
    locationPreventCircle,
    locationCheckPoint,
    locationSubway
  }),
)(Menu);
