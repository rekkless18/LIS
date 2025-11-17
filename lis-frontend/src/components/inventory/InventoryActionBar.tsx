import React, { useState } from 'react'
import { Space, Button, Modal, Form, Input, Select, message } from 'antd'
import { useInventoryStore, Threshold } from '@/stores/inventory'

const { Option } = Select

interface Props { onQuery: () => void; onReset: () => void }

export const InventoryActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createItem, editItem, deleteItems, filteredItems } = useInventoryStore()
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [form] = Form.useForm()

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true) }
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      createItem({ materialNo: values.materialNo, materialName: values.materialName, manufacturer: values.manufacturer, batchNo: values.batchNo, validPeriod: values.validPeriod, threshold: values.threshold as Threshold, quantity: Number(values.quantity) })
      setOpenCreate(false)
      message.success('新建物料成功')
    })
  }

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个物料'); return }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0])
    if (!target) { message.warning('未找到选中物料'); return }
    form.setFieldsValue({ materialNo: target.materialNo, materialName: target.materialName, manufacturer: target.manufacturer, batchNo: target.batchNo, validPeriod: target.validPeriod, threshold: target.threshold, quantity: target.quantity })
    setOpenEdit(true)
  }
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string
    form.validateFields().then(values => {
      editItem(id, { materialNo: values.materialNo, materialName: values.materialName, manufacturer: values.manufacturer, batchNo: values.batchNo, validPeriod: values.validPeriod, threshold: values.threshold as Threshold, quantity: Number(values.quantity) })
      setOpenEdit(false)
      message.success('编辑物料成功')
    })
  }

  const handleDelete = () => { if (selectedRowKeys.length) deleteItems(selectedRowKeys as string[]) }

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

      <Modal title="新建物料" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="物料编号" name="materialNo" rules={[{ required: true, message: '请输入物料编号' }]}><Input /></Form.Item>
          <Form.Item label="物料名称" name="materialName" rules={[{ required: true, message: '请输入物料名称' }]}><Input /></Form.Item>
          <Form.Item label="生产厂家" name="manufacturer" rules={[{ required: true, message: '请输入生产厂家' }]}><Input /></Form.Item>
          <Form.Item label="批次号" name="batchNo" rules={[{ required: true, message: '请输入批次号' }]}><Input /></Form.Item>
          <Form.Item label="有效期" name="validPeriod" rules={[{ required: true, message: '请输入有效期' }]}><Input /></Form.Item>
          <Form.Item label="总量" name="quantity" rules={[{ required: true, message: '请输入总量' }]}><Input type="number" /></Form.Item>
          <Form.Item label="库存阈值" name="threshold" rules={[{ required: true, message: '请选择库存阈值' }]}><Select placeholder="请选择">{(['告罄','低','中','高'] as Threshold[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑物料" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="物料编号" name="materialNo" rules={[{ required: true, message: '请输入物料编号' }]}><Input /></Form.Item>
          <Form.Item label="物料名称" name="materialName" rules={[{ required: true, message: '请输入物料名称' }]}><Input /></Form.Item>
          <Form.Item label="生产厂家" name="manufacturer" rules={[{ required: true, message: '请输入生产厂家' }]}><Input /></Form.Item>
          <Form.Item label="批次号" name="batchNo" rules={[{ required: true, message: '请输入批次号' }]}><Input /></Form.Item>
          <Form.Item label="有效期" name="validPeriod" rules={[{ required: true, message: '请输入有效期' }]}><Input /></Form.Item>
          <Form.Item label="总量" name="quantity" rules={[{ required: true, message: '请输入总量' }]}><Input type="number" /></Form.Item>
          <Form.Item label="库存阈值" name="threshold" rules={[{ required: true, message: '请选择库存阈值' }]}><Select placeholder="请选择">{(['告罄','低','中','高'] as Threshold[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

