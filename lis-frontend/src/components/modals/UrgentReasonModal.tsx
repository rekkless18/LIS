import React, { useState } from 'react';
import { Modal, Form, Select, Input } from 'antd';

interface UrgentReasonModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (reason: string, type: string) => void;
}

export const UrgentReasonModal: React.FC<UrgentReasonModalProps> = ({
  visible,
  onCancel,
  onConfirm
}) => {
  const [form] = Form.useForm();
  const [urgentType, setUrgentType] = useState('');
  const [urgentReason, setUrgentReason] = useState('');

  const urgentTypeOptions = [
    { value: 'pathology', label: '病理原因' },
    { value: 'vip', label: 'VIP' },
    { value: 'value_added', label: '增值服务' },
    { value: 'other', label: '其他' }
  ];

  const handleOk = () => {
    form.validateFields().then(values => {
      onConfirm(values.urgentReason, values.urgentType);
      form.resetFields();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="订单加急"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="提交"
      cancelText="取消"
      okButtonProps={{
        disabled: !urgentType || !urgentReason.trim()
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          urgentType: '',
          urgentReason: ''
        }}
      >
        <Form.Item
          label="加急类型"
          name="urgentType"
          rules={[{ required: true, message: '请选择加急类型' }]}
        >
          <Select
            placeholder="请选择加急类型"
            onChange={setUrgentType}
          >
            {urgentTypeOptions.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="加急原因"
          name="urgentReason"
          rules={[{ required: true, message: '请输入加急原因' }]}
        >
          <Input.TextArea
            placeholder="请输入加急原因"
            rows={4}
            onChange={(e) => setUrgentReason(e.target.value)}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
