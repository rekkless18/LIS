import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Form, Input, Select, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useApprovalConfigStore, FlowType, FlowLevel, EnableStatus } from '@/stores/approvalConfig'

const { Option } = Select

interface Props { onSearch: () => void; onReset: () => void }

export const ApprovalFlowSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()
  const { filters, setFilters } = useApprovalConfigStore()
  const [collapsed, setCollapsed] = useState(true)

  const typeOptions: FlowType[] = ['加急申请','库存采购申请','请假申请']
  const levelOptions: FlowLevel[] = ['一级审批','二级审批','三级审批']
  const statusOptions: EnableStatus[] = ['启用','禁用']

  useEffect(() => {
    form.setFieldsValue({
      codes: filters.codes?.join(', ') || '',
      nameKeyword: filters.nameKeyword || '',
      types: filters.types || typeOptions,
      levels: filters.levels || levelOptions,
      statuses: filters.statuses || statusOptions,
    })
  }, [filters, form])

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        codes: values.codes ? String(values.codes).split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        nameKeyword: values.nameKeyword || undefined,
        types: values.types || undefined,
        levels: values.levels || undefined,
        statuses: values.statuses || undefined,
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
          <Col xs={24} sm={12} md={6}><Form.Item label="审批流程编号" name="codes"><Input placeholder="多个审批流程编号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="审批流程名称" name="nameKeyword"><Input placeholder="请输入审批流程名称" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="审批流程类型" name="types"><Select mode="multiple" placeholder="请选择审批流程类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="审批级别" name="levels"><Select mode="multiple" placeholder="请选择审批级别">{levelOptions.map(l => (<Option key={l} value={l}>{l}</Option>))}</Select></Form.Item></Col>
          {!collapsed && (<>
            <Col xs={24} sm={12} md={6}><Form.Item label="审批流程状态" name="statuses"><Select mode="multiple" placeholder="请选择审批流程状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
          </>)}
        </Row>
      </Form>
      
    </Card>
  )
}