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
  const [productOptions, setProductOptions] = useState<{ id: string, product_name: string }[]>([]);

  /**
   * 功能描述：加载启用的产品选项供“产品+样本类型组件”使用
   * 参数说明：无
   * 返回值类型及用途：无；更新本地选项状态
   */
  const loadEnabledProducts = async () => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
    const resp = await fetch(`${API_BASE}/products/enabled`);
    const json = await resp.json();
    const raw = Array.isArray(json) ? json : (json?.data || []);
    setProductOptions(raw || []);
  };

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true); };
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      const types: PackageType[] = (values.packageType || []) as PackageType[];
      const firstType = types?.[0] as PackageType;
      const items = ((values.packageItems || []) as any[]).map(r => ({ productId: r.productId, sampleType: r.sampleType }));
      if (!items.length) { message.warning('请至少新增一行产品+样本类型'); return; }
      createItem({ packageCode: values.packageCode, packageName: values.packageName, packageType: firstType, productNames: [], packageItems: items, status: values.status as EnableStatus });
      setOpenCreate(false);
      message.success('新建套餐成功');
    });
  };

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个套餐'); return; }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0]);
    if (!target) { message.warning('未找到选中套餐'); return; }
    form.setFieldsValue({ packageCode: target.packageCode, packageName: target.packageName, packageType: [target.packageType], status: target.status, packageItems: [] });
    setOpenEdit(true);
  };
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string;
    form.validateFields().then(values => {
      const types: PackageType[] = (values.packageType || []) as PackageType[];
      const firstType = types?.[0] as PackageType;
      const items = ((values.packageItems || []) as any[]).map(r => ({ productId: r.productId, sampleType: r.sampleType }));
      if (!items.length) { message.warning('请至少新增一行产品+样本类型'); return; }
      editItem(id, { packageCode: values.packageCode, packageName: values.packageName, packageType: firstType, productNames: [], packageItems: items, status: values.status as EnableStatus });
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

      <Modal title="新建套餐" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭" afterOpenChange={(opened) => { if (opened) loadEnabledProducts(); }}>
        <Form form={form} layout="vertical">
          <Form.Item label="套餐编码" name="packageCode" rules={[{ required: true, message: '请输入套餐编码' }]}><Input /></Form.Item>
          <Form.Item label="套餐名称" name="packageName" rules={[{ required: true, message: '请输入套餐名称' }]}><Input /></Form.Item>
          <Form.Item label="套餐类型" name="packageType" rules={[{ required: true, message: '请选择套餐类型' }]}><Select mode="multiple" placeholder="请选择">{(['常规套餐','科研套餐','VIP套餐'] as PackageType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.List name="packageItems">
            {(fields, { add, remove }) => (
              <div>
                {fields.map(field => (
                  <div key={field.key} className="flex items-center gap-2 py-1">
                    <Form.Item {...field} name={[field.name, 'productId']} label={field.name === 0 ? '产品' : ''} className="flex-1" rules={[{ required: true, message: '请选择产品' }]}>
                      <Select placeholder="请选择产品">{productOptions.map(p => (<Option key={p.id} value={p.id}>{p.product_name}</Option>))}</Select>
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'sampleType']} label={field.name === 0 ? '样本类型' : ''} className="flex-1" rules={[{ required: true, message: '请选择样本类型' }]}>
                      <Select placeholder="请选择样本类型">{(['全血','血浆','组织液','尿液','切片'] as string[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select>
                    </Form.Item>
                    <Button onClick={() => remove(field.name)} danger>删除</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()}>新增行</Button>
              </div>
            )}
          </Form.List>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑套餐" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭" afterOpenChange={(opened) => { if (opened) loadEnabledProducts(); }}>
        <Form form={form} layout="vertical">
          <Form.Item label="套餐编码" name="packageCode" rules={[{ required: true, message: '请输入套餐编码' }]}><Input /></Form.Item>
          <Form.Item label="套餐名称" name="packageName" rules={[{ required: true, message: '请输入套餐名称' }]}><Input /></Form.Item>
          <Form.Item label="套餐类型" name="packageType" rules={[{ required: true, message: '请选择套餐类型' }]}><Select mode="multiple" placeholder="请选择">{(['常规套餐','科研套餐','VIP套餐'] as PackageType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.List name="packageItems">
            {(fields, { add, remove }) => (
              <div>
                {fields.map(field => (
                  <div key={field.key} className="flex items-center gap-2 py-1">
                    <Form.Item {...field} name={[field.name, 'productId']} label={field.name === 0 ? '产品' : ''} className="flex-1" rules={[{ required: true, message: '请选择产品' }]}>
                      <Select placeholder="请选择产品">{productOptions.map(p => (<Option key={p.id} value={p.id}>{p.product_name}</Option>))}</Select>
                    </Form.Item>
                    <Form.Item {...field} name={[field.name, 'sampleType']} label={field.name === 0 ? '样本类型' : ''} className="flex-1" rules={[{ required: true, message: '请选择样本类型' }]}>
                      <Select placeholder="请选择样本类型">{(['全血','血浆','组织液','尿液','切片'] as string[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select>
                    </Form.Item>
                    <Button onClick={() => remove(field.name)} danger>删除</Button>
                  </div>
                ))}
                <Button type="dashed" onClick={() => add()}>新增行</Button>
              </div>
            )}
          </Form.List>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

