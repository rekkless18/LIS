import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Form, Select, Input, Descriptions, Divider, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useOrderStore } from '@/stores/order';

interface UrgentReasonModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (reason: string, type: string, requestCode: string) => void;
}

export const UrgentReasonModal: React.FC<UrgentReasonModalProps> = ({
  visible,
  onCancel,
  onConfirm
}) => {
  const [form] = Form.useForm();
  const [urgentType, setUrgentType] = useState('');
  const [requestCode, setRequestCode] = useState('');
  const [urgentReason, setUrgentReason] = useState('');
  const { selectedRowKeys, filteredOrders } = useOrderStore();
  const selectedOrders = useMemo(() => filteredOrders.filter(o => selectedRowKeys.includes(o.id)), [filteredOrders, selectedRowKeys]);
  const tableRows = useMemo(() => selectedOrders.map(o => ({
    key: o.id,
    orderNo: o.orderNo,
    sampleNos: (o.sampleNos || []).join(','),
    productNames: (o.items || []).map(it => it.product?.name).filter(Boolean).join(',')
  })), [selectedOrders]);
  const columns: ColumnsType<any> = [
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 180, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-44">{text}</span></Tooltip>) },
    { title: '样本编号', dataIndex: 'sampleNos', key: 'sampleNos', width: 220, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-56">{text}</span></Tooltip>) },
    { title: '产品名称', dataIndex: 'productNames', key: 'productNames', width: 220, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-56">{text}</span></Tooltip>) }
  ];

  const urgentTypeOptions = [
    { value: 'pathology', label: '病理原因' },
    { value: 'vip', label: 'VIP' },
    { value: 'value_added', label: '增值服务' },
    { value: 'other', label: '其他' }
  ];

  useEffect(() => {
    const run = async () => {
      if (!visible) return;
      setRequestCode('');
      const base = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api';
      try {
        const resp = await fetch(`${base}/approval/requests/code`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flow_type: 'urgent' }) });
        const json = await resp.json();
        if (json?.success && json?.request_code) setRequestCode(json.request_code);
      } catch {}
    };
    run();
  }, [visible]);

  const handleOk = () => {
    form.validateFields().then(values => {
      onConfirm(values.urgentReason || '', values.urgentType, requestCode);
      form.resetFields();
    }).catch(() => {});
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="加急审批"
      open={visible}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="提交"
      cancelText="取消"
      okButtonProps={{
        disabled: !urgentType
      }}
    >
      <Descriptions size="small" column={1} bordered>
        <Descriptions.Item label="审批单编号">{requestCode || '生成中...'}</Descriptions.Item>
      </Descriptions>
      <Divider style={{ margin: '12px 0' }} />
      <Table
        rowKey="key"
        columns={columns}
        dataSource={tableRows}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: columns.reduce((s, c) => s + (typeof c.width === 'number' ? c.width : 120), 0) }}
      />
      <Divider style={{ margin: '12px 0' }} />
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
          label="申请原因"
          name="urgentReason"
        >
          <Input.TextArea
            placeholder="请输入申请原因"
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
