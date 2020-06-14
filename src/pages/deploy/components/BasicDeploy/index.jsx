/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import {
  Icon,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Checkbox,
  TimePicker,
  message,
  Modal,
} from 'antd';
import {
  circleType as circleTypeConfig,
  workingDayType as workingDayTypeConfig,
} from '@/utils/config';
import styles from './index.scss';

let keysId = 1;
const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

function BasicDeploy(props) {
  const {
    form,
    dispatch,
    branchOfficeList,
    policeStationList,
    basicDeployForm,
    closeThePreventCircle,
    circleType: defaultCircleType,
  } = props;
  const {
    getFieldDecorator,
    getFieldValue,
    setFieldsValue,
    validateFieldsAndScroll,
    getFieldsValue,
  } = form;
  const {
    name, // "lll"
    type, // 3
    countyCode, // "33010300"
    countyName, // "下城分局"
    responsibleUnitCode, // "33010356"
    responsibleUnitName, // "朝晖派出所"
    timePeriodJson = '{}', // "{"workingDayType":[1],"crossDaySetting":[true],"startTime":["13:05:17"],"endTime":["13:05:19"]}"
    rapidDisposalArea, // "lll"
  } = basicDeployForm;
  const { workingDayType = [], crossDaySetting = [], startTime = [], endTime = [] } = JSON.parse(
    timePeriodJson,
  );
  const isEdit = Object.keys(basicDeployForm).length > 0;
  if (isEdit) keysId = workingDayType.length;

  useEffect(() => {
    dispatch({ type: 'deploy/getBranchOfficeList' });
  }, []);

  const remove = k => {
    const keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  };

  const add = () => {
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(keysId++);
    form.setFieldsValue({
      keys: nextKeys,
    });
  };

  getFieldDecorator('keys', { initialValue: isEdit ? workingDayType.map((_, i) => i) : [0] });
  const keys = getFieldValue('keys');
  const formItems = keys.map((_, k) => (
    <React.Fragment key={k}>
      <Row gutter={16} type="flex" align="bottom">
        <Col span={13}>
          <Form.Item label="重点时段">
            {getFieldDecorator(`workingDayType[${k}]`, {
              rules: [
                {
                  required: true,
                  message: '请输入必填项',
                },
              ],
              initialValue: isEdit ? workingDayType[k] : undefined,
            })(
              <Select placeholder="请选择工作日类型">
                {workingDayTypeConfig.map(obj => (
                  <Option key={obj.key} value={obj.key}>
                    {obj.value}
                  </Option>
                ))}
              </Select>,
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item>
            {getFieldDecorator(`crossDaySetting[${k}]`, {
              valuePropName: 'checked',
              initialValue: isEdit ? crossDaySetting[k] : false,
            })(<Checkbox>跨天设置</Checkbox>)}
          </Form.Item>
        </Col>
        <Col span={3}>
          {k === 0 ? (
            <Icon className={styles.icon} type="plus-circle-o" onClick={add} />
          ) : (
            <Icon className={styles.icon} type="minus-circle-o" onClick={() => remove(k)} />
          )}
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item>
            {getFieldDecorator(`startTime[${k}]`, {
              rules: [
                {
                  required: true,
                  message: '请输入必填项',
                },
              ],
              initialValue: isEdit && startTime[k] ? moment(startTime[k], 'HH:mm:ss') : undefined,
            })(<TimePicker style={{ width: '100%' }} placeholder="请输入开始时间" />)}
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item>
            {getFieldDecorator(`endTime[${k}]`, {
              rules: [
                {
                  required: true,
                  message: '请输入必填项',
                },
              ],
              initialValue: isEdit && endTime[k] ? moment(endTime[k], 'HH:mm:ss') : undefined,
            })(<TimePicker style={{ width: '100%' }} placeholder="请输入结束时间" />)}
          </Form.Item>
        </Col>
      </Row>
    </React.Fragment>
  ));

  const handleSubmit = e => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { crossDaySetting, startTime, endTime } = values;
        for (let i = 0; i < crossDaySetting.length; i++) {
          if (!crossDaySetting[i] && startTime[i].unix() > endTime[i].unix()) {
            message.error('开始时间不能大于结束时间');
            return;
          }
        }
        dispatch({ type: 'deploy/updateBasicInfo', payload: { data: values } }).then(res => {});
      }
    });
  };

  const closeModal = () => {
    const { name, branchOffice, policeStation, quickDisposal } = getFieldsValue();
    if (name || branchOffice || policeStation || quickDisposal) {
      confirm({
        title: '您当前正在编辑,是否确认退出?',
        okText: '退出',
        cancelText: '取消',
        onOk() {
          dispatch({ type: 'deploy/resetForm' });
          closeThePreventCircle && closeThePreventCircle(basicDeployForm);
        },
        onCancel() {},
      });
    } else {
      dispatch({ type: 'deploy/resetForm' });
      message.info('未修改');
      closeThePreventCircle && closeThePreventCircle(basicDeployForm);
    }
  };

  const onBranchOfficeChange = value => {
    setFieldsValue({ policeStation: undefined });
    const { key: orgId } = value;
    dispatch({ type: 'deploy/getPoliceStationList', payload: { orgId } });
  };

  return (
    <div className={styles.basicDeployContainer}>
      <div className={styles.header}>
        <span>基础配置</span>
        <Icon type="close" onClick={closeModal} />
      </div>
      <div className={styles.content}>
        <Form onSubmit={handleSubmit}>
          <Form.Item label="类型">
            {getFieldDecorator('circleType', {
              rules: [
                {
                  required: true,
                  message: '请输入必填项',
                },
              ],
              initialValue: isEdit ? type : defaultCircleType,
            })(
              <Select placeholder="请选择类型">
                {circleTypeConfig.map(obj => (
                  <Option key={obj.key} value={obj.key}>
                    {obj.value}
                  </Option>
                ))}
              </Select>,
            )}
          </Form.Item>
          <Form.Item label="名称">
            {getFieldDecorator('name', {
              rules: [
                { transform: value => value && value.trim() },
                {
                  required: true,
                  message: '请输入必填项',
                },
                {
                  max: 12,
                  message: '文本长度超出限制',
                },
              ],
              initialValue: isEdit ? name : undefined,
            })(<Input placeholder="名称长度请控制在12字以内" />)}
          </Form.Item>
          <Row gutter={16} type="flex" align="bottom">
            <Col span={12}>
              <Form.Item label="责任单位">
                {getFieldDecorator('branchOffice', {
                  rules: [
                    {
                      required: true,
                      message: '请输入必填项',
                    },
                  ],
                  initialValue: isEdit ? { key: countyCode, label: countyName } : undefined,
                })(
                  <Select placeholder="请选择所属分局" onChange={onBranchOfficeChange} labelInValue>
                    {branchOfficeList.map(obj => (
                      <Option key={obj.orgId} value={obj.orgId}>
                        {obj.orgName}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item>
                {getFieldDecorator('policeStation', {
                  rules: [
                    {
                      required: true,
                      message: '请输入必填项',
                    },
                  ],
                  initialValue: isEdit
                    ? { key: responsibleUnitCode, label: responsibleUnitName }
                    : undefined,
                })(
                  <Select placeholder="请选择责任单位" labelInValue>
                    {policeStationList.map(obj => (
                      <Option key={obj.orgId} value={obj.orgId}>
                        {obj.orgName}
                      </Option>
                    ))}
                  </Select>,
                )}
              </Form.Item>
            </Col>
          </Row>
          {formItems}
          <Form.Item label="快速处置部位和区域">
            {getFieldDecorator('quickDisposal', {
              rules: [
                { transform: value => value && value.trim() },
                {
                  required: true,
                  message: '请输入必填项',
                },
                {
                  max: 40,
                  message: '文本长度超出限制',
                },
              ],
              initialValue: isEdit ? rapidDisposalArea : undefined,
            })(<TextArea placeholder="文本长度建议在40字以内" />)}
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

const WrappedBasicDeploy = Form.create({
  name: 'basicDeploy',
  onFieldsChange(props, changedFields, allFields) {
    const {
      name: { value: name },
      branchOffice: { value: branchOffice },
      quickDisposal: { value: quickDisposal },
    } = allFields;
    props.dispatch({
      type: 'deploy/save',
      payload: { testForm: { name, branchOffice, quickDisposal } },
    });
  },
})(BasicDeploy);

export default connect(
  ({
    deploy: { branchOfficeList, policeStationList, circleType, basicDeployForm },
    map: { closeThePreventCircle, locationPreventCircle },
  }) => ({
    branchOfficeList,
    policeStationList,
    circleType,
    basicDeployForm,
    closeThePreventCircle,
    locationPreventCircle,
  }),
)(WrappedBasicDeploy);
