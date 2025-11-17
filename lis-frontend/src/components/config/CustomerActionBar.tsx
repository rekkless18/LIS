import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input, Select, message } from 'antd';
import { useCustomerConfigStore, CustomerType, Region, EnableStatus } from '@/stores/configCustomer';

const { Option } = Select;

interface Props { onQuery: () => void; onReset: () => void }

export const CustomerActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createItem, editItem, deleteItems, enableItems, disableItems, filteredItems } = useCustomerConfigStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true); };
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      createItem({ customerCode: values.customerCode, customerName: values.customerName, customerType: values.customerType as CustomerType, regions: values.regions as Region[], status: values.status as EnableStatus });
      setOpenCreate(false);
      message.success('新建客户成功');
    });
  };

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个客户'); return; }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0]);
    if (!target) { message.warning('未找到选中客户'); return; }
    form.setFieldsValue({ customerCode: target.customerCode, customerName: target.customerName, customerType: target.customerType, regions: target.regions, status: target.status });
    setOpenEdit(true);
  };
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string;
    form.validateFields().then(values => {
      editItem(id, { customerCode: values.customerCode, customerName: values.customerName, customerType: values.customerType as CustomerType, regions: values.regions as Region[], status: values.status as EnableStatus });
      setOpenEdit(false);
      message.success('编辑客户成功');
    });
  };

  const handleDelete = () => { if (selectedRowKeys.length) deleteItems(selectedRowKeys as string[]); };
  const handleEnable = () => { if (selectedRowKeys.length) enableItems(selectedRowKeys as string[]); };
  const handleDisable = () => { if (selectedRowKeys.length) disableItems(selectedRowKeys as string[]); };

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOpenCreate}>新建</Button>
        <Button onClick={handleOpenEdit} disabled={!selectedRowKeys.length}>编辑</Button>
        <Button danger onClick={handleDelete} disabled={!selectedRowKeys.length}>删除</Button>
        <Button onClick={handleEnable} disabled={!selectedRowKeys.length}>启用</Button>
        <Button onClick={handleDisable} disabled={!selectedRowKeys.length}>禁用</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="新建客户" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="客户编码" name="customerCode" rules={[{ required: true, message: '请输入客户编码' }]}><Input /></Form.Item>
          <Form.Item label="客户名称" name="customerName" rules={[{ required: true, message: '请输入客户名称' }]}><Input /></Form.Item>
          <Form.Item label="客户类型" name="customerType" rules={[{ required: true, message: '请选择客户类型' }]}><Select placeholder="请选择">{(['企业客户','高校客户','科研客户'] as CustomerType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="区域" name="regions" rules={[{ required: true, message: '请选择区域' }]}><Select mode="multiple" placeholder="请选择">{(['大陆','港澳台','西欧','东南亚','中东','北美','其他'] as Region[]).map(r => (<Option key={r} value={r}>{r}</Option>))}</Select></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑客户" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="客户编码" name="customerCode" rules={[{ required: true, message: '请输入客户编码' }]}><Input /></Form.Item>
          <Form.Item label="客户名称" name="customerName" rules={[{ required: true, message: '请输入客户名称' }]}><Input /></Form.Item>
          <Form.Item label="客户类型" name="customerType" rules={[{ required: true, message: '请选择客户类型' }]}><Select placeholder="请选择">{(['企业客户','高校客户','科研客户'] as CustomerType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="区域" name="regions" rules={[{ required: true, message: '请选择区域' }]}><Select mode="multiple" placeholder="请选择">{(['大陆','港澳台','西欧','东南亚','中东','北美','其他'] as Region[]).map(r => (<Option key={r} value={r}>{r}</Option>))}</Select></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

