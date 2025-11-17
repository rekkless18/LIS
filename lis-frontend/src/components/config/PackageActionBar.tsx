import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input, Select, message } from 'antd';
import { usePackageConfigStore, PackageType, EnableStatus } from '@/stores/configPackage';

const { Option } = Select;

interface Props { onQuery: () => void; onReset: () => void }

export const PackageActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createItem, editItem, deleteItems, enableItems, disableItems, filteredItems } = usePackageConfigStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true); };
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      createItem({ packageCode: values.packageCode, packageName: values.packageName, packageType: values.packageType as PackageType, productNames: values.productNames || [], status: values.status as EnableStatus });
      setOpenCreate(false);
      message.success('新建套餐成功');
    });
  };

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个套餐'); return; }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0]);
    if (!target) { message.warning('未找到选中套餐'); return; }
    form.setFieldsValue({ packageCode: target.packageCode, packageName: target.packageName, packageType: target.packageType, productNames: target.productNames, status: target.status });
    setOpenEdit(true);
  };
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string;
    form.validateFields().then(values => {
      editItem(id, { packageCode: values.packageCode, packageName: values.packageName, packageType: values.packageType as PackageType, productNames: values.productNames || [], status: values.status as EnableStatus });
      setOpenEdit(false);
      message.success('编辑套餐成功');
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

      <Modal title="新建套餐" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="套餐编码" name="packageCode" rules={[{ required: true, message: '请输入套餐编码' }]}><Input /></Form.Item>
          <Form.Item label="套餐名称" name="packageName" rules={[{ required: true, message: '请输入套餐名称' }]}><Input /></Form.Item>
          <Form.Item label="套餐类型" name="packageType" rules={[{ required: true, message: '请选择套餐类型' }]}><Select placeholder="请选择">{(['常规套餐','科研套餐','VIP套餐'] as PackageType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="产品名称" name="productNames"><Select mode="multiple" placeholder="请选择产品" /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑套餐" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="套餐编码" name="packageCode" rules={[{ required: true, message: '请输入套餐编码' }]}><Input /></Form.Item>
          <Form.Item label="套餐名称" name="packageName" rules={[{ required: true, message: '请输入套餐名称' }]}><Input /></Form.Item>
          <Form.Item label="套餐类型" name="packageType" rules={[{ required: true, message: '请选择套餐类型' }]}><Select placeholder="请选择">{(['常规套餐','科研套餐','VIP套餐'] as PackageType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="产品名称" name="productNames"><Select mode="multiple" placeholder="请选择产品" /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

