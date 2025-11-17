import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input, Select, message } from 'antd';
import { useEquipmentStore, DeviceType, DeviceStatus } from '@/stores/equipment';

const { Option } = Select;

interface Props { onQuery: () => void; onReset: () => void; }

/** 函数功能：设备管理操作栏组件；参数：查询与重置回调；返回值：React元素；用途：渲染功能按钮区 */
export const EquipActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createDevice, editDevice, deleteDevices, filteredDevices } = useEquipmentStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form] = Form.useForm();

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true); };
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      const payload = { deviceNo: values.deviceNo, deviceName: values.deviceName, deviceType: values.deviceType as DeviceType, status: values.status as DeviceStatus, location: values.location, manufacturer: values.manufacturer };
      createDevice(payload);
      setOpenCreate(false);
      message.success('新建设备成功');
    });
  };

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个设备'); return; }
    const target = filteredDevices.find(d => d.id === selectedRowKeys[0]);
    if (!target) { message.warning('未找到选中设备'); return; }
    form.setFieldsValue({ deviceNo: target.deviceNo, deviceName: target.deviceName, deviceType: target.deviceType, status: target.status, location: target.location, manufacturer: target.manufacturer });
    setOpenEdit(true);
  };
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string;
    form.validateFields().then(values => {
      editDevice(id, { deviceNo: values.deviceNo, deviceName: values.deviceName, deviceType: values.deviceType as DeviceType, status: values.status as DeviceStatus, location: values.location, manufacturer: values.manufacturer });
      setOpenEdit(false);
      message.success('编辑设备成功');
    });
  };

  const handleDelete = () => { if (selectedRowKeys.length) deleteDevices(selectedRowKeys as string[]); };

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

      <Modal title="新建设备" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="设备编号" name="deviceNo" rules={[{ required: true, message: '请输入设备编号' }]}><Input placeholder="请输入设备编号" /></Form.Item>
          <Form.Item label="设备名称" name="deviceName" rules={[{ required: true, message: '请输入设备名称' }]}><Input placeholder="请输入设备名称" /></Form.Item>
          <Form.Item label="设备类型" name="deviceType" rules={[{ required: true, message: '请选择设备类型' }]}><Select placeholder="请选择设备类型">{(['测序仪','QPCR仪','离心机','培养箱','生化仪器','质谱仪器','血液仪器','冰箱','其他'] as DeviceType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="设备状态" name="status" rules={[{ required: true, message: '请选择设备状态' }]}><Select placeholder="请选择设备状态">{(['运行','关机','维护','故障','报废'] as DeviceStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
          <Form.Item label="设备位置" name="location" rules={[{ required: true, message: '请输入设备位置' }]}><Input placeholder="请输入设备位置" /></Form.Item>
          <Form.Item label="生产厂家" name="manufacturer"><Input placeholder="请输入生产厂家名称" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑设备" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="设备编号" name="deviceNo" rules={[{ required: true, message: '请输入设备编号' }]}><Input placeholder="请输入设备编号" /></Form.Item>
          <Form.Item label="设备名称" name="deviceName" rules={[{ required: true, message: '请输入设备名称' }]}><Input placeholder="请输入设备名称" /></Form.Item>
          <Form.Item label="设备类型" name="deviceType" rules={[{ required: true, message: '请选择设备类型' }]}><Select placeholder="请选择设备类型">{(['测序仪','QPCR仪','离心机','培养箱','生化仪器','质谱仪器','血液仪器','冰箱','其他'] as DeviceType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="设备状态" name="status" rules={[{ required: true, message: '请选择设备状态' }]}><Select placeholder="请选择设备状态">{(['运行','关机','维护','故障','报废'] as DeviceStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
          <Form.Item label="设备位置" name="location" rules={[{ required: true, message: '请输入设备位置' }]}><Input placeholder="请输入设备位置" /></Form.Item>
          <Form.Item label="生产厂家" name="manufacturer"><Input placeholder="请输入生产厂家名称" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

