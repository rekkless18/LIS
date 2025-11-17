import React from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { useLogisticsStore } from '@/stores/logistics';

const { Option } = Select;

interface Props { visible: boolean; onClose: () => void; onSuccess: () => void; }

const NewLogisticsModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const { create } = useLogisticsStore();

  const handleOk = async () => {
    const v = await form.validateFields();
    create({ waybillNo: v.waybillNo, orderNo: v.orderNo, company: v.company, status: v.status, shippedAt: v.shippedAt.toDate().toISOString(), author: 'admin' });
    message.success('新建物流成功');
    onSuccess();
    onClose();
  };

  return (
    <Modal title="新建物流" open={visible} onCancel={onClose} onOk={handleOk} okText="提交" cancelText="取消">
      <Form form={form} layout="vertical">
        <Form.Item label="物流单号" name="waybillNo" rules={[{ required: true }]}>
          <Input placeholder="请输入物流单号" />
        </Form.Item>
        <Form.Item label="订单编号" name="orderNo" rules={[{ required: true }]}>
          <Input placeholder="请输入订单编号" />
        </Form.Item>
        <Form.Item label="物流公司" name="company" rules={[{ required: true }]}>
          <Select placeholder="请选择物流公司">
            {['顺丰','圆通','中通','申通','韵达','EMS','京东物流','德邦','自送样','其他'].map(c => (<Option key={c} value={c}>{c}</Option>))}
          </Select>
        </Form.Item>
        <Form.Item label="物流状态" name="status" initialValue={'pending'}>
          <Select placeholder="请选择物流状态">
            <Option value="pending">待发货</Option>
            <Option value="in_transit">运输中</Option>
            <Option value="delivered">已签收</Option>
            <Option value="exception">异常</Option>
          </Select>
        </Form.Item>
        <Form.Item label="发货日期" name="shippedAt" rules={[{ required: true }]}>
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择发货日期" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewLogisticsModal;
