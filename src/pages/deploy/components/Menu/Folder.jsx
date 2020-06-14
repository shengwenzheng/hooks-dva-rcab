import React from 'react';
import styles from './Folder.scss';
import folderImg from '@/assets/images/folder.png';

function Folder(props) {
  const { click, total, name, onClick } = props;

  const getFolderStyle = () => {
    if (!total) return { cursor: 'not-allowed' };
    if (click) return { backgroundColor: '#fff', borderColor: '#2950B8' };
  };

  return (
    <div className={styles.folderContainer} style={getFolderStyle()} onClick={onClick}>
      <div className={styles.status} style={click ? { backgroundColor: '#2950B8' } : null} />
      <img src={folderImg} alt="folderImg" />
      <span className={styles.name}>{name}</span>
      <span className={styles.total}>( {total} )</span>
      {/* <span className={styles.right}>共{total || 0}个</span> */}
    </div>
  );
}

export default Folder;
