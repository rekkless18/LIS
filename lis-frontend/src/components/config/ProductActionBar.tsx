import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input, Select, message } from 'antd';
import { useProductConfigStore, ProductType, EnableStatus } from '@/stores/configProduct';

const { Option } = Select;

interface Props { onQuery: () => void; onReset: () => void }

export const ProductActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createItem, editItem, deleteItems, enableItems, disableItems, filteredItems } = useProductConfigStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true); };
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      createItem({ productCode: values.productCode, productName: values.productName, productType: values.productType as ProductType, status: values.status as EnableStatus, testItems: values.testItems || [] });
      setOpenCreate(false);
      message.success('新建产品成功');
    });
  };

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个产品'); return; }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0]);
    if (!target) { message.warning('未找到选中产品'); return; }
    form.setFieldsValue({ productCode: target.productCode, productName: target.productName, productType: target.productType, status: target.status, testItems: target.testItems });
    setOpenEdit(true);
  };
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string;
    form.validateFields().then(values => {
      editItem(id, { productCode: values.productCode, productName: values.productName, productType: values.productType as ProductType, status: values.status as EnableStatus, testItems: values.testItems || [] });
      setOpenEdit(false);
      message.success('编辑产品成功');
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

      <Modal title="新建产品" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="产品编码" name="productCode" rules={[{ required: true, message: '请输入产品编码' }]}><Input /></Form.Item>
          <Form.Item label="产品名称" name="productName" rules={[{ required: true, message: '请输入产品名称' }]}><Input /></Form.Item>
          <Form.Item label="产品类型" name="productType" rules={[{ required: true, message: '请选择产品类型' }]}><Select placeholder="请选择">{(['普检产品','特检产品','质谱产品','研发产品','其他产品'] as ProductType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="检测项" name="testItems"><Select mode="multiple" placeholder="请选择检测项" /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑产品" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="产品编码" name="productCode" rules={[{ required: true, message: '请输入产品编码' }]}><Input /></Form.Item>
          <Form.Item label="产品名称" name="productName" rules={[{ required: true, message: '请输入产品名称' }]}><Input /></Form.Item>
          <Form.Item label="产品类型" name="productType" rules={[{ required: true, message: '请选择产品类型' }]}><Select placeholder="请选择">{(['普检产品','特检产品','质谱产品','研发产品','其他产品'] as ProductType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="检测项" name="testItems"><Select mode="multiple" placeholder="请选择检测项" /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

