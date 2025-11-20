import React, { useEffect, useMemo, useState } from 'react'
import { Space, Button, Modal, Form, Input, Descriptions, Tag, message, Table, Tooltip } from 'antd'
import { useApprovalStore } from '@/stores/approval'
import { useAuthStore } from '@/stores/auth'

interface Props { onQuery: () => void; onReset: () => void }

export const ApprovalActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, filteredItems } = useApprovalStore()
  const [openApprove, setOpenApprove] = useState(false)
  const [openWithdraw, setOpenWithdraw] = useState(false)
  const [formApprove] = Form.useForm()
  const [formWithdraw] = Form.useForm()
  const [detail, setDetail] = useState<any>(null)
  const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
  const urgentParsed = useMemo(() => {
    if (!detail || !detail.content || detail.flow_type !== 'urgent') return null
    const s: string = detail.content
    const parts = s.split('；')
    const kv: Record<string, string> = {}
    parts.forEach(p => {
      const idx = p.indexOf('：')
      if (idx > -1) {
        const k = p.slice(0, idx).trim()
        const v = p.slice(idx + 1).trim()
        kv[k] = v
      }
    })
    const orderNos = (kv['订单'] || '').split('、').map(x => x.trim()).filter(Boolean)
    const sampleNos = (kv['样本'] || '').split(',').map(x => x.trim()).filter(Boolean)
    const productNames = (kv['产品'] || '').split(',').map(x => x.trim()).filter(Boolean)
    const urgentType = kv['加急类型'] || ''
    const reason = kv['原因'] || ''
    const rows = orderNos.map((no, i) => ({ key: `${no}-${i}`, orderNo: no, sampleNos: sampleNos.join(','), productNames: productNames.join(',') }))
    const columns = [
      { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 180, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-44">{text}</span></Tooltip>) },
      { title: '样本编号', dataIndex: 'sampleNos', key: 'sampleNos', width: 220, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-56">{text}</span></Tooltip>) },
      { title: '产品名称', dataIndex: 'productNames', key: 'productNames', width: 220, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-56">{text}</span></Tooltip>) }
    ]
    return { urgentType, reason, rows, columns }
  }, [detail])
  const inventoryParsed = useMemo(() => {
    if (!detail || !detail.content || detail.flow_type !== 'inventory_purchase') return null
    const s: string = detail.content
    const parts = s.split('；')
    const first = parts[0] || ''
    let materialName = ''
    let quantity: number | string = ''
    const idxColon = first.indexOf('：')
    if (idxColon > -1) {
      const payload = first.slice(idxColon + 1).trim()
      const idxX = payload.lastIndexOf('x')
      if (idxX > -1) {
        materialName = payload.slice(0, idxX).trim()
        quantity = payload.slice(idxX + 1).trim()
      } else {
        materialName = payload
      }
    }
    let reason = ''
    parts.slice(1).forEach(p => {
      const i = p.indexOf('：')
      if (i > -1) {
        const k = p.slice(0, i).trim()
        const v = p.slice(i + 1).trim()
        if (k === '原因') reason = v
      }
    })
    return { materialName, quantity, reason }
  }, [detail])

  const loadDetail = async (id: string) => {
    try {
      const resp = await fetch(`${API_BASE}/approval/requests/${id}`)
      const json = await resp.json()
      if (!json?.success) throw new Error(json?.error || '加载审批单失败')
      setDetail(json.data)
      return json.data
    } catch (e: any) {
      message.error(e?.message || '加载审批单失败')
      return null
    }
  }
  const handleOpenApprove = async () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个审批单'); return }
    const id = selectedRowKeys[0] as string
    await loadDetail(id)
    formApprove.resetFields()
    setOpenApprove(true)
  }
  const handleOpenWithdraw = async () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个审批单'); return }
    const id = selectedRowKeys[0] as string
    const currentId = useAuthStore.getState().user?.id || ''
    const item = filteredItems.find(d => d.id === id) as any
    if (!item || item.applicantId !== currentId) { message.warning('仅能撤回本人提交的审批单'); return }
    const data = await loadDetail(id)
    if (!data) return
    formWithdraw.resetFields()
    setOpenWithdraw(true)
  }
  const submitAction = async (action: 'approve' | 'reject' | 'withdraw', reason: string) => {
    try {
      const operator = useAuthStore.getState().user?.id || ''
      const id = selectedRowKeys[0] as string
      const resp = await fetch(`${API_BASE}/approval/requests/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, reason, operator_id: operator }) })
      const json = await resp.json()
      if (!resp.ok || !json?.success) throw new Error(json?.error || '操作失败')
      message.success('操作成功')
      setOpenApprove(false)
      setOpenWithdraw(false)
      onQuery()
    } catch (e: any) {
      message.error(e?.message || '操作失败')
    }
  }

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOpenApprove}>审批</Button>
        <Button onClick={handleOpenWithdraw} disabled={!selectedRowKeys.length} title={!selectedRowKeys.length ? '请选择至少一个审批单' : undefined}>撤回</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
      <Modal title="审批" open={openApprove} onCancel={() => setOpenApprove(false)} footer={[
        <Button key="pass" type="primary" onClick={() => { formApprove.validateFields().then(v => submitAction('approve', v.reason || '')) }}>通过</Button>,
        <Button key="reject" danger onClick={() => { formApprove.validateFields().then(v => submitAction('reject', v.reason || '')) }}>驳回</Button>
      ]}>
        {detail && (
          <>
            <Descriptions size="small" column={3} bordered>
              <Descriptions.Item label="审批单编号">{detail.request_code}</Descriptions.Item>
              <Descriptions.Item label="审批类型">{detail.flow_type === 'urgent' ? '加急申请' : detail.flow_type === 'inventory_purchase' ? '库存采购申请' : '请假申请'}</Descriptions.Item>
              <Descriptions.Item label="审批级别">{detail.level === 1 ? '一级审批' : detail.level === 2 ? '二级审批' : '三级审批'}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{new Date(detail.created_at || '').toLocaleDateString('zh-CN')}</Descriptions.Item>
              <Descriptions.Item label="申请人">{detail.applicant}</Descriptions.Item>
            </Descriptions>
            {detail.flow_type === 'urgent' && urgentParsed && (
              <div className="py-3 space-y-2">
                <Descriptions size="small" column={2} bordered>
                  <Descriptions.Item label="加急类型">{urgentParsed.urgentType || '-'}</Descriptions.Item>
                  <Descriptions.Item label="申请原因">{urgentParsed.reason || '-'}</Descriptions.Item>
                </Descriptions>
                <Table rowKey="key" columns={urgentParsed.columns as any} dataSource={urgentParsed.rows} pagination={false} size="small" bordered />
              </div>
            )}
            {detail.flow_type === 'inventory_purchase' && inventoryParsed && (
              <div className="py-3">
                <Descriptions size="small" column={3} bordered>
                  <Descriptions.Item label="物料名称">{inventoryParsed.materialName || '-'}</Descriptions.Item>
                  <Descriptions.Item label="数量">{inventoryParsed.quantity || '-'}</Descriptions.Item>
                  <Descriptions.Item label="申请原因">{inventoryParsed.reason || '-'}</Descriptions.Item>
                </Descriptions>
              </div>
            )}
            <div className="py-3">
              {(detail.flow || []).map((n: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 py-1">
                  <Tag color={n.index === 0 ? 'default' : 'processing'}>{n.index}</Tag>
                  <span>{n.approver || '-'}</span>
                  <Tag color={n.status === '已通过' ? 'green' : n.status === '已驳回' ? 'red' : n.status === '已撤回' ? 'default' : 'blue'}>{n.status}</Tag>
                </div>
              ))}
            </div>
            <Form form={formApprove} layout="vertical">
              <Form.Item label="审批理由" name="reason" rules={[{ required: true, message: '请输入审批理由' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
      <Modal title="撤回" open={openWithdraw} onCancel={() => setOpenWithdraw(false)} footer={[
        <Button key="withdraw" danger onClick={() => { formWithdraw.validateFields().then(v => submitAction('withdraw', v.reason || '')) }}>撤回</Button>
      ]}>
        {detail && (
          <>
            <Descriptions size="small" column={3} bordered>
              <Descriptions.Item label="审批单编号">{detail.request_code}</Descriptions.Item>
              <Descriptions.Item label="审批类型">{detail.flow_type === 'urgent' ? '加急申请' : detail.flow_type === 'inventory_purchase' ? '库存采购申请' : '请假申请'}</Descriptions.Item>
              <Descriptions.Item label="审批级别">{detail.level === 1 ? '一级审批' : detail.level === 2 ? '二级审批' : '三级审批'}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{new Date(detail.created_at || '').toLocaleDateString('zh-CN')}</Descriptions.Item>
              <Descriptions.Item label="申请人">{detail.applicant}</Descriptions.Item>
            </Descriptions>
            <div className="py-3">
              {(detail.flow || []).map((n: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 py-1">
                  <Tag color={n.index === 0 ? 'default' : 'processing'}>{n.index}</Tag>
                  <span>{n.approver || '-'}</span>
                  <Tag color={n.status === '已通过' ? 'green' : n.status === '已驳回' ? 'red' : n.status === '已撤回' ? 'default' : 'blue'}>{n.status}</Tag>
                </div>
              ))}
            </div>
            <Form form={formWithdraw} layout="vertical">
              <Form.Item label="撤回理由" name="reason" rules={[{ required: true, message: '请输入撤回理由' }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  )
}

