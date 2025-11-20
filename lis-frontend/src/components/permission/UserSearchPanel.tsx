import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useUserConfigStore, UserType, EnableStatus } from '@/stores/permissionUser'

const { RangePicker } = DatePicker
const { Option } = Select

interface Props { onSearch: () => void; onReset: () => void }

export const UserSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()
  const { filters, setFilters } = useUserConfigStore()
  const [collapsed, setCollapsed] = useState(true)
  const typeOptions: UserType[] = ['内部用户','外部用户']
  const statusOptions: EnableStatus[] = ['启用','禁用']
  const deptOptions: string[] = ['销售部','采购部','门诊部','检验科','财务部','人力部','后勤部','行政部','其他','运维部']

  useEffect(() => {
    form.setFieldsValue({
      accounts: filters.accounts?.join(', ') || '',
      nameKeyword: filters.nameKeyword || '',
      userTypes: filters.userTypes || typeOptions,
      statuses: filters.statuses || statusOptions,
      departments: filters.departments || deptOptions,
      lastLoginRange: undefined,
      lastPwdChangeRange: undefined,
      createdRange: undefined
    })
  }, [filters, form])

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        accounts: values.accounts ? values.accounts.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        nameKeyword: values.nameKeyword || undefined,
        userTypes: values.userTypes || undefined,
        statuses: values.statuses || undefined,
        departments: values.departments || undefined,
        lastLoginRange: values.lastLoginRange ? [values.lastLoginRange[0].toDate().toISOString(), values.lastLoginRange[1].toDate().toISOString()] as [string,string] : undefined,
        lastPwdChangeRange: values.lastPwdChangeRange ? [values.lastPwdChangeRange[0].toDate().toISOString(), values.lastPwdChangeRange[1].toDate().toISOString()] as [string,string] : undefined,
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
            accounts: all.accounts ? String(all.accounts).split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
            nameKeyword: all.nameKeyword || undefined,
            userTypes: all.userTypes || undefined,
            statuses: all.statuses || undefined,
            departments: all.departments || undefined,
            lastLoginRange: all.lastLoginRange ? [all.lastLoginRange[0].toDate().toISOString(), all.lastLoginRange[1].toDate().toISOString()] as [string,string] : undefined,
            lastPwdChangeRange: all.lastPwdChangeRange ? [all.lastPwdChangeRange[0].toDate().toISOString(), all.lastPwdChangeRange[1].toDate().toISOString()] as [string,string] : undefined,
            createdRange: all.createdRange ? [all.createdRange[0].toDate().toISOString(), all.createdRange[1].toDate().toISOString()] as [string,string] : undefined
          }
          setFilters(next)
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}><Form.Item label="用户账号" name="accounts"><Input placeholder="多个用户账号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="用户姓名" name="nameKeyword"><Input placeholder="请输入用户姓名" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="用户类型" name="userTypes"><Select mode="multiple" placeholder="请选择用户类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
          {!collapsed && (
            <>
              <Col xs={24} sm={12} md={6}><Form.Item label="最后登录时间" name="lastLoginRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="最后修改密码时间" name="lastPwdChangeRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdRange"><RangePicker format="YYYY-MM-DD" placeholder={["开始日期","结束日期"]} /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="部门" name="departments"><Select mode="multiple" placeholder="请选择部门" options={deptOptions.map(d => ({ label: d, value: d }))} /></Form.Item></Col>
            </>
          )}
        </Row>
      </Form>
    </Card>
  )
}

