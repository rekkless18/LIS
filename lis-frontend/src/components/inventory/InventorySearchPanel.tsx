import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useInventoryStore, Threshold } from '@/stores/inventory'

const { Option } = Select

interface Props { onSearch: () => void; onReset: () => void }

export const InventorySearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()
  const { filters, setFilters } = useInventoryStore()
  const [collapsed, setCollapsed] = useState(true)

  const thresholdOptions: Threshold[] = ['告罄','低','中','高']

  useEffect(() => {
    form.setFieldsValue({
      materialNos: filters.materialNos?.join(', ') || '',
      materialNameKeyword: filters.materialNameKeyword || '',
      manufacturerKeyword: filters.manufacturerKeyword || '',
      batchNoKeyword: filters.batchNoKeyword || '',
      createdDate: undefined,
      validPeriodKeyword: filters.validPeriodKeyword || '',
      thresholds: filters.thresholds || thresholdOptions
    })
  }, [filters, form])

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        materialNos: values.materialNos ? values.materialNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        materialNameKeyword: values.materialNameKeyword || undefined,
        manufacturerKeyword: values.manufacturerKeyword || undefined,
        batchNoKeyword: values.batchNoKeyword || undefined,
        createdDate: values.createdDate ? values.createdDate.toDate().toISOString() : undefined,
        validPeriodKeyword: values.validPeriodKeyword || undefined,
        thresholds: values.thresholds || undefined
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
          <Col xs={24} sm={12} md={6}><Form.Item label="物料编号" name="materialNos"><Input placeholder="多个物料编号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="物料名称" name="materialNameKeyword"><Input placeholder="请输入物料名称" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="生产厂家" name="manufacturerKeyword"><Input placeholder="请输入生产厂家" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="批次号" name="batchNoKeyword"><Input placeholder="请输入批次号" /></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdDate"><DatePicker format="YYYY-MM-DD" placeholder="请选择日期" /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="有效期" name="validPeriodKeyword"><Input placeholder="请输入有效期" /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="库存阈值" name="thresholds"><Select mode="multiple" placeholder="请选择库存阈值">{thresholdOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  )
}
