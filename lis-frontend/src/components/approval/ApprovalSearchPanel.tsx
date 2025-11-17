import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useApprovalStore, ApprovalType, ApprovalStatus } from '@/stores/approval'

const { Option } = Select

interface Props { onSearch: () => void; onReset: () => void }

export const ApprovalSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()
  const { filters, setFilters } = useApprovalStore()
  const [collapsed, setCollapsed] = useState(true)

  const typeOptions: ApprovalType[] = ['加急申请','库存采购申请','请假申请']
  const statusOptions: ApprovalStatus[] = ['已审批','已通过','已驳回']

  useEffect(() => {
    form.setFieldsValue({
      approvalNos: filters.approvalNos?.join(', ') || '',
      types: filters.types || typeOptions,
      statuses: filters.statuses || statusOptions,
      createdDate: undefined,
      applicantKeyword: filters.applicantKeyword || ''
    })
  }, [filters, form])

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        approvalNos: values.approvalNos ? values.approvalNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        types: values.types || undefined,
        statuses: values.statuses || undefined,
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
          <Col xs={24} sm={12} md={6}><Form.Item label="审批单类型" name="types"><Select mode="multiple" placeholder="请选择类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="审批单状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdDate"><DatePicker format="YYYY-MM-DD" placeholder="请选择日期" /></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="申请人" name="applicantKeyword"><Input placeholder="请输入申请人" /></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  )
}
