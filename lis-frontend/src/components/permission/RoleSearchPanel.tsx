import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useRoleConfigStore, RoleType, EnableStatus } from '@/stores/permissionRole'

const { RangePicker } = DatePicker
const { Option } = Select

interface Props { onSearch: () => void; onReset: () => void }

export const RoleSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()
  const { filters, setFilters } = useRoleConfigStore()
  const [collapsed, setCollapsed] = useState(true)
  const typeOptions: RoleType[] = ['内部角色','外部角色']
  const statusOptions: EnableStatus[] = ['启用','禁用']

  useEffect(() => {
    form.setFieldsValue({ codes: filters.codes?.join(', ') || '', nameKeyword: filters.nameKeyword || '', roleTypes: filters.roleTypes || typeOptions, statuses: filters.statuses || statusOptions, createdRange: undefined })
  }, [filters, form])

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        codes: values.codes ? values.codes.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        nameKeyword: values.nameKeyword || undefined,
        roleTypes: values.roleTypes || undefined,
        statuses: values.statuses || undefined,
        createdRange: values.createdRange ? [values.createdRange[0].toDate().toISOString(), values.createdRange[1].toDate().toISOString()] as [string,string] : undefined
      }
      setFilters(next)
      onSearch()
    })
  }

  const handleReset = () => { form.resetFields(); onReset() }

  return (
    <Card title="查询条件" size="small" styles={{ body: { padding: 16 } }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical"
        onValuesChange={(changed, all) => {
          const next = {
            codes: all.codes ? String(all.codes).split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
            nameKeyword: all.nameKeyword || undefined,
            roleTypes: all.roleTypes || undefined,
            statuses: all.statuses || undefined,
            createdRange: all.createdRange ? [all.createdRange[0].toDate().toISOString(), all.createdRange[1].toDate().toISOString()] as [string,string] : undefined
          }
          setFilters(next)
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}><Form.Item label="角色编码" name="codes"><Input placeholder="多个角色编码用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="角色名称" name="nameKeyword"><Input placeholder="请输入角色名称" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="角色类型" name="roleTypes"><Select mode="multiple" placeholder="请选择角色类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (<><Row gutter={16}><Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdRange"><RangePicker format="YYYY-MM-DD" placeholder={["开始日期","结束日期"]} /></Form.Item></Col></Row></>)}
      </Form>
    </Card>
  )
}

