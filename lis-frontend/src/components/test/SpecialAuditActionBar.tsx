import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input } from 'antd';
import { useSpecialAuditStore } from '@/stores/specialAudit';

interface Props { onQuery: () => void; onReset: () => void; }

export const SpecialAuditActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, approve, reject } = useSpecialAuditStore();
  const [openReject, setOpenReject] = useState(false);
  const [form] = Form.useForm();
  const handleApprove = () => { if (selectedRowKeys.length) approve(selectedRowKeys as string[]); };
  const handleOpenReject = () => { if (selectedRowKeys.length) { form.resetFields(); setOpenReject(true); } };
  const handleRejectSubmit = () => { form.validateFields().then(values => { reject(selectedRowKeys as string[], values.reason || ''); setOpenReject(false); }); };
  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleApprove} disabled={!selectedRowKeys.length}>审核通过</Button>
        <Button onClick={handleOpenReject} disabled={!selectedRowKeys.length}>审核不通过</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="审核不通过" open={openReject} onOk={handleRejectSubmit} onCancel={() => setOpenReject(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="不通过原因" name="reason" rules={[{ required: true, message: '请输入不通过原因' }]}>
            <Input.TextArea rows={3} placeholder="请输入不通过原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

