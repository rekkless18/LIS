import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input, Select, message } from 'antd';
import { useEnvironmentStore, EnvStatus, ProtectionLevel } from '@/stores/environment';

const { Option } = Select;

interface Props { onQuery: () => void; onReset: () => void; }

/** 函数功能：环境管理操作栏组件；参数：查询与重置回调；返回值：React元素；用途：渲染功能按钮区 */
export const EnvActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createRoom, editRoom, deleteRooms, filteredRooms } = useEnvironmentStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true); };
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      const payload = { roomNo: values.roomNo, roomLocation: values.roomLocation, status: values.status as EnvStatus, protectionLevel: values.protectionLevel as ProtectionLevel };
      createRoom(payload);
      setOpenCreate(false);
      message.success('新建房间成功');
    });
  };

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个房间'); return; }
    const target = filteredRooms.find(r => r.id === selectedRowKeys[0]);
    if (!target) { message.warning('未找到选中房间'); return; }
    form.setFieldsValue({ roomNo: target.roomNo, roomLocation: target.roomLocation, status: target.status, protectionLevel: target.protectionLevel });
    setOpenEdit(true);
  };
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string;
    form.validateFields().then(values => {
      editRoom(id, { roomNo: values.roomNo, roomLocation: values.roomLocation, status: values.status as EnvStatus, protectionLevel: values.protectionLevel as ProtectionLevel });
      setOpenEdit(false);
      message.success('编辑房间成功');
    });
  };

  const handleDelete = () => { if (selectedRowKeys.length) deleteRooms(selectedRowKeys as string[]); };

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOpenCreate}>新建</Button>
        <Button onClick={handleOpenEdit} disabled={!selectedRowKeys.length}>编辑</Button>
        <Button danger onClick={handleDelete} disabled={!selectedRowKeys.length}>删除</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="新建房间" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="房间号" name="roomNo" rules={[{ required: true, message: '请输入房间号' }]}><Input placeholder="请输入房间号" /></Form.Item>
          <Form.Item label="房间位置" name="roomLocation" rules={[{ required: true, message: '请输入房间位置' }]}><Input placeholder="请输入房间位置" /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择状态">{(['正常','异常'] as EnvStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
          <Form.Item label="防护等级" name="protectionLevel" rules={[{ required: true, message: '请选择防护等级' }]}><Select placeholder="请选择防护等级">{(['一级','二级','三级'] as ProtectionLevel[]).map(l => (<Option key={l} value={l}>{l}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑房间" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="房间号" name="roomNo" rules={[{ required: true, message: '请输入房间号' }]}><Input placeholder="请输入房间号" /></Form.Item>
          <Form.Item label="房间位置" name="roomLocation" rules={[{ required: true, message: '请输入房间位置' }]}><Input placeholder="请输入房间位置" /></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择状态">{(['正常','异常'] as EnvStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
          <Form.Item label="防护等级" name="protectionLevel" rules={[{ required: true, message: '请选择防护等级' }]}><Select placeholder="请选择防护等级">{(['一级','二级','三级'] as ProtectionLevel[]).map(l => (<Option key={l} value={l}>{l}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

