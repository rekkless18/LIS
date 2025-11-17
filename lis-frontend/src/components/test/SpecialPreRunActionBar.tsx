import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input } from 'antd';
import { useSpecialPreRunStore } from '@/stores/specialPreRun';

interface Props { onQuery: () => void; onReset: () => void; }

export const SpecialPreRunActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, order, start, cancel } = useSpecialPreRunStore();
  const [openStartModal, setOpenStartModal] = useState(false);
  const [form] = Form.useForm();

  const handleOrder = () => { if (selectedRowKeys.length) order(selectedRowKeys as string[]); };
  const handleCancel = () => { if (selectedRowKeys.length) cancel(selectedRowKeys as string[]); };
  const handleOpenStart = () => { if (selectedRowKeys.length) { form.resetFields(); setOpenStartModal(true); } };
  const handleStartSubmit = () => {
    form.validateFields().then(values => {
      start(selectedRowKeys as string[], { qcResult: values.qcResult, workstation: values.workstation });
      setOpenStartModal(false);
    });
  };

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOrder} disabled={!selectedRowKeys.length}>下单</Button>
        <Button type="primary" onClick={handleOpenStart} disabled={!selectedRowKeys.length}>开始</Button>
        <Button danger onClick={handleCancel} disabled={!selectedRowKeys.length}>取消任务</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal
        title="任务开始"
        open={openStartModal}
        onOk={handleStartSubmit}
        onCancel={() => setOpenStartModal(false)}
        okText="开始任务"
        cancelText="关闭"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="实验结果" name="experimentResult">
            <Input placeholder="请输入实验结果" />
          </Form.Item>
          <Form.Item label="质控结果" name="qcResult">
            <Input placeholder="请输入质控结果" />
          </Form.Item>
          <Form.Item label="设备/工位" name="workstation">
            <Input placeholder="请输入设备或工位" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

