import React, { useState } from 'react'
import { Space, Button, Modal, Form, Input, message } from 'antd'
import { useApprovalStore } from '@/stores/approval'

interface Props { onQuery: () => void; onReset: () => void }

export const ApprovalActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, approve, reject } = useApprovalStore()
  const [openApprove, setOpenApprove] = useState(false)
  const [openReject, setOpenReject] = useState(false)
  const [form] = Form.useForm()

  const handleOpenApprove = () => { if (!selectedRowKeys.length) { message.warning('请至少选择一个审批单'); return }; form.resetFields(); setOpenApprove(true) }
  const handleApproveSubmit = () => { form.validateFields().then(values => { approve(selectedRowKeys as string[], values.reason || ''); setOpenApprove(false) }) }
  const handleOpenReject = () => { if (!selectedRowKeys.length) { message.warning('请至少选择一个审批单'); return }; form.resetFields(); setOpenReject(true) }
  const handleRejectSubmit = () => { form.validateFields().then(values => { reject(selectedRowKeys as string[], values.reason || ''); setOpenReject(false) }) }

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOpenApprove}>审批</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="审批" open={openApprove} onOk={handleApproveSubmit} onCancel={() => setOpenApprove(false)} okText="通过" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="审批理由" name="reason" rules={[{ required: true, message: '请输入审批理由' }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="审批" open={openReject} onOk={handleRejectSubmit} onCancel={() => setOpenReject(false)} okText="驳回" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="审批理由" name="reason" rules={[{ required: true, message: '请输入审批理由' }]}><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

