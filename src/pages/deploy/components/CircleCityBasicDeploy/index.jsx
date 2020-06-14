/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'dva';
import { Icon, Form, Input, Button, message, Modal } from 'antd';
import styles from './index.scss';

const { confirm } = Modal;

function CircleCityBasicDeploy(props) {
  const { form, dispatch } = props;
  const { getFieldDecorator, validateFieldsAndScroll, getFieldsValue } = form;

  useEffect(() => {
    dispatch({ type: 'deploy/getBranchOfficeList' });
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        dispatch({ type: 'deploy/updateCircleCityBasicInfo', payload: { data: values } });
      }
    });
  };

  const closeModal = () => {
    const { title, person } = getFieldsValue();
    if (title || person) {
      confirm({
        title: '您当前正在编辑,是否确认退出?',
        okText: '退出',
        cancelText: '取消',
        onOk() {
          dispatch({ type: 'deploy/resetForm' });
        },
        onCancel() {},
      });
    } else {
      dispatch({ type: 'deploy/resetForm' });
      message.info('未修改');
    }
  };

  return (
    <div className={styles.basicDeployContainer}>
      <div className={styles.header}>
        <span>环城圈-基础配置</span>
        <Icon type="close" onClick={closeModal} />
      </div>
      <div className={styles.content}>
        <Form onSubmit={handleSubmit}>
          <Form.Item label="名称">
            {getFieldDecorator('title', {
              rules: [
                { transform: value => value && value.trim() },
                {
                  required: true,
                  message: '请输入必填项',
                },
                {
                  max: 18,
                  message: '文本长度超出限制',
                },
              ],
              // initialValue: isEdit ? name : undefined,
            })(<Input placeholder="名称长度请控制在18字以内" />)}
          </Form.Item>
          <Form.Item label="经度">
            {getFieldDecorator('longitude', {
              rules: [
                { transform: value => value && value.trim() },
                {
                  required: true,
                  message: '请输入必填项',
                },
              ],
              // initialValue: isEdit ? name : undefined,
            })(<Input placeholder="请输入经度" />)}
          </Form.Item>
          <Form.Item label="纬度">
            {getFieldDecorator('latitude', {
              rules: [
                { transform: value => value && value.trim() },
                {
                  required: true,
                  message: '请输入必填项',
                },
              ],
              // initialValue: isEdit ? name : undefined,
            })(<Input placeholder="请输入纬度" />)}
          </Form.Item>
          <Form.Item label="责任人">
            {getFieldDecorator('person', {
              rules: [
                { transform: value => value && value.trim() },
                {
                  required: true,
                  message: '请输入必填项',
                },
              ],
              // initialValue: isEdit ? name : undefined,
            })(<Input placeholder="请输入责任人" />)}
          </Form.Item>
          <div className={styles.formFooter}>
            <Button onClick={closeModal}>取消</Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

const WrappedCircleCityBasicDeploy = Form.create({
  name: 'circleCityBasicDeploy',
  onFieldsChange(props, changedFields, allFields) {
    const {
      title: { value: title },
      person: { value: person },
    } = allFields;
    props.dispatch({
      type: 'deploy/save',
      payload: { testForm: { title, person } },
    });
  },
})(CircleCityBasicDeploy);

export default connect()(WrappedCircleCityBasicDeploy);
