import React, { useState } from 'react'
import { Space, Button, Modal, Form, Input, Select, message, InputNumber, Descriptions } from 'antd'
import { useInventoryStore, Threshold } from '@/stores/inventory'
import { useAuthStore } from '@/stores/auth'

const { Option } = Select

interface Props { onQuery: () => void; onReset: () => void }

export const InventoryActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createItem, editItem, deleteItems, filteredItems } = useInventoryStore()
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [form] = Form.useForm()
  const [openPurchase, setOpenPurchase] = useState(false)
  const [submitting, setSubmitting] = useState(false)

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
        <Button onClick={handleOpenEdit} disabled={!selectedRowKeys.length} title={!selectedRowKeys.length ? '请选择一个物料' : undefined}>编辑</Button>
        <Button danger onClick={handleDelete} disabled={!selectedRowKeys.length}>删除</Button>
        <Button onClick={() => setOpenPurchase(true)}>库存采购</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="新建物料" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="物料编号" name="materialNo" rules={[{ required: true, message: '请输入物料编号' }]}><Input placeholder="请输入物料编号" /></Form.Item>
          <Form.Item label="物料名称" name="materialName" rules={[{ required: true, message: '请输入物料名称' }]}><Input placeholder="请输入物料名称" /></Form.Item>
          <Form.Item label="生产厂家" name="manufacturer" rules={[{ required: true, message: '请输入生产厂家' }]}><Input placeholder="请输入生产厂家" /></Form.Item>
          <Form.Item label="批次号" name="batchNo" rules={[{ required: true, message: '请输入批次号' }]}><Input placeholder="请输入批次号" /></Form.Item>
          <Form.Item label="有效期" name="validPeriod" rules={[{ required: true, message: '请选择有效期' }]}>
            <Input type="date" placeholder="请选择日期" min={new Date().toISOString().slice(0,10)} />
          </Form.Item>
          <Form.Item label="总量" name="quantity" rules={[{ required: true, message: '请输入总量' }]}><InputNumber placeholder="请输入总量" min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="库存阈值" name="threshold" rules={[{ required: true, message: '请选择库存阈值' }]}>
            <Select placeholder="请选择">
              <Option value="告罄">告罄（剩余0%）</Option>
              <Option value="低">低（10%以下）</Option>
              <Option value="中">中（25%以下）</Option>
              <Option value="高">高（50%以下）</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑物料" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="物料编号" name="materialNo" rules={[{ required: true, message: '请输入物料编号' }]}><Input placeholder="请输入物料编号" /></Form.Item>
          <Form.Item label="物料名称" name="materialName" rules={[{ required: true, message: '请输入物料名称' }]}><Input placeholder="请输入物料名称" /></Form.Item>
          <Form.Item label="生产厂家" name="manufacturer" rules={[{ required: true, message: '请输入生产厂家' }]}><Input placeholder="请输入生产厂家" /></Form.Item>
          <Form.Item label="批次号" name="batchNo" rules={[{ required: true, message: '请输入批次号' }]}><Input placeholder="请输入批次号" /></Form.Item>
          <Form.Item label="有效期" name="validPeriod" rules={[{ required: true, message: '请选择有效期' }]}>
            <Input type="date" placeholder="请选择日期" min={new Date().toISOString().slice(0,10)} />
          </Form.Item>
          <Form.Item label="总量" name="quantity" rules={[{ required: true, message: '请输入总量' }]}><InputNumber placeholder="请输入总量" min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="库存阈值" name="threshold" rules={[{ required: true, message: '请选择库存阈值' }]}>
            <Select placeholder="请选择">
              <Option value="告罄">告罄（剩余0%）</Option>
              <Option value="低">低（10%以下）</Option>
              <Option value="中">中（25%以下）</Option>
              <Option value="高">高（50%以下）</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="库存采购审批" open={openPurchase} onOk={async () => {
        const base = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
        const userId = useAuthStore.getState().user?.id || ''
        try {
          const values = await form.validateFields()
          setSubmitting(true)
          const resp = await fetch(`${base}/approval/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              flow_type: 'inventory_purchase',
              applicant_id: userId,
              material_name: values.purchaseMaterialName,
              quantity: Number(values.purchaseQuantity),
              reason: values.purchaseReason || ''
            })
          })
          const json = await resp.json()
          if (!resp.ok || !json?.success) throw new Error(json?.error || '提交失败')
          message.success(`已提交库存采购申请：${json.request_code}`)
          setOpenPurchase(false)
          form.resetFields()
        } catch (e: any) {
          message.error(e?.message || '提交失败')
        } finally {
          setSubmitting(false)
        }
      }} onCancel={() => setOpenPurchase(false)} okText="提交" cancelText="关闭" confirmLoading={submitting}>
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label="审批单编号">提交后生成</Descriptions.Item>
        </Descriptions>
        <Form form={form} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item label="物料名称" name="purchaseMaterialName" rules={[{ required: true, message: '请输入物料名称' }]}>
            <Input placeholder="请输入物料名称" />
          </Form.Item>
          <Form.Item label="数量" name="purchaseQuantity" rules={[{ required: true, message: '请输入数量' }]}>
            <InputNumber placeholder="请输入数量" min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="申请原因" name="purchaseReason">
            <Input.TextArea placeholder="请输入申请原因" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

