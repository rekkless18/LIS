import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input, Select, message } from 'antd';
import { useTestItemConfigStore, TestItemType, JudgeType, EnableStatus } from '@/stores/configTestItem';

const { Option } = Select;

interface Props { onQuery: () => void; onReset: () => void }

export const TestItemActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createItem, editItem, deleteItems, enableItems, disableItems, filteredItems } = useTestItemConfigStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true); };
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      createItem({ itemCode: values.itemCode, itemName: values.itemName, itemTypes: values.itemTypes as TestItemType[], judgeTypes: values.judgeTypes as JudgeType[], status: values.status as EnableStatus });
      setOpenCreate(false);
      message.success('新建检测项成功');
    });
  };

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个检测项'); return; }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0]);
    if (!target) { message.warning('未找到选中检测项'); return; }
    form.setFieldsValue({ itemCode: target.itemCode, itemName: target.itemName, itemTypes: target.itemTypes, judgeTypes: target.judgeTypes, status: target.status });
    setOpenEdit(true);
  };
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string;
    form.validateFields().then(values => {
      editItem(id, { itemCode: values.itemCode, itemName: values.itemName, itemTypes: values.itemTypes as TestItemType[], judgeTypes: values.judgeTypes as JudgeType[], status: values.status as EnableStatus });
      setOpenEdit(false);
      message.success('编辑检测项成功');
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

      <Modal title="新建检测项" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="检测项编码" name="itemCode" rules={[{ required: true, message: '请输入检测项编码' }]}><Input /></Form.Item>
          <Form.Item label="检测项名称" name="itemName" rules={[{ required: true, message: '请输入检测项名称' }]}><Input /></Form.Item>
          <Form.Item label="检测项类型" name="itemTypes" rules={[{ required: true, message: '请选择检测项类型' }]}><Select mode="multiple" placeholder="请选择">{(['普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项'] as TestItemType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="结果判断类型" name="judgeTypes" rules={[{ required: true, message: '请选择结果判断类型' }]}><Select mode="multiple" placeholder="请选择">{(['上限','下限','上下限','定性','阴阳性','聚合'] as JudgeType[]).map(j => (<Option key={j} value={j}>{j}</Option>))}</Select></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑检测项" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="检测项编码" name="itemCode" rules={[{ required: true, message: '请输入检测项编码' }]}><Input /></Form.Item>
          <Form.Item label="检测项名称" name="itemName" rules={[{ required: true, message: '请输入检测项名称' }]}><Input /></Form.Item>
          <Form.Item label="检测项类型" name="itemTypes" rules={[{ required: true, message: '请选择检测项类型' }]}><Select mode="multiple" placeholder="请选择">{(['普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项'] as TestItemType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="结果判断类型" name="judgeTypes" rules={[{ required: true, message: '请选择结果判断类型' }]}><Select mode="multiple" placeholder="请选择">{(['上限','下限','上下限','定性','阴阳性','聚合'] as JudgeType[]).map(j => (<Option key={j} value={j}>{j}</Option>))}</Select></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

