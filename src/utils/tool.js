export const judgeCheckStatus = (allList, checkedList) => {
  if (checkedList.length === 0) return false;
  if (checkedList.length < allList.length) return 'indeterminate';
  return true;
};

export const isJSON = str => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str);
      if (typeof obj === 'object' && obj) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
};

export const isBasicDeployEdit = form => {
  const arr = Object.keys(form).filter(key => form[key]);
  if (arr.length) return true;
  return false;
};
