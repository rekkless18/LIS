import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useApprovalStore, ApprovalType, ApprovalStatus, ApprovalLevel } from '@/stores/approval'

const { Option } = Select

interface Props { onSearch: () => void; onReset: () => void }

export const ApprovalSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()
  const { filters, setFilters } = useApprovalStore()
  const [collapsed, setCollapsed] = useState(true)

  const typeOptions: ApprovalType[] = ['加急申请','库存采购申请','请假申请']
  const levelOptions: ApprovalLevel[] = ['一级审批','二级审批','三级审批']
  const statusOptions: ApprovalStatus[] = ['审批中','已通过','已驳回','已撤回']

  useEffect(() => {
    form.setFieldsValue({
      approvalNos: filters.approvalNos?.join(', ') || '',
      types: filters.types || typeOptions,
      levels: filters.levels || levelOptions,
      statuses: filters.statuses || undefined,
      createdDate: undefined,
      applicantKeyword: filters.applicantKeyword || ''
    })
  }, [filters, form])

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        approvalNos: values.approvalNos ? values.approvalNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        types: Array.isArray(values.types) ? values.types.map((s: string) => s.trim()).filter(Boolean) : undefined,
        levels: Array.isArray(values.levels) ? values.levels.map((s: string) => s.trim()).filter(Boolean) : undefined,
        statuses: Array.isArray(values.statuses) ? values.statuses.map((s: string) => s.trim()).filter(Boolean) : undefined,
        createdDate: values.createdDate ? values.createdDate.toDate().toISOString() : undefined,
        applicantKeyword: values.applicantKeyword || undefined
      }
      setFilters(next)
      onSearch()
    })
  }

  const handleReset = () => { form.resetFields(); onReset() }

  return (
    <Card title="查询条件" size="small" styles={{ body: { padding: 16 } }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}><Form.Item label="审批单编号" name="approvalNos"><Input placeholder="多个审批单编号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="审批流程类型" name="types"><Select mode="multiple" placeholder="请选择审批流程类型" onChange={(vals) => setFilters({ types: (vals as string[]).map(v => v.trim()).filter(Boolean) as any })}>{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="审批级别" name="levels"><Select mode="multiple" placeholder="请选择审批级别" onChange={(vals) => setFilters({ levels: (vals as string[]).map(v => v.trim()).filter(Boolean) as any })}>{levelOptions.map(l => (<Option key={l} value={l}>{l}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="审批状态" name="statuses"><Select mode="multiple" placeholder="请选择审批状态" onChange={(vals) => setFilters({ statuses: (vals as string[]).map(v => v.trim()).filter(Boolean) as any })}>{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdDate"><DatePicker format="YYYY-MM-DD" placeholder="请选择日期" /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="申请人" name="applicantKeyword"><Input placeholder="请输入申请人" /></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  )
}
