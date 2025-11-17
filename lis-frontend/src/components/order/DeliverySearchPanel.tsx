import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Form, Input, Select, Button } from 'antd'
import { DownOutlined, UpOutlined } from '@ant-design/icons'
import { useReportDeliveryStore, ReportStatus } from '@/stores/reportDelivery'

const { Option } = Select

interface Props { onSearch: () => void; onReset: () => void }

const DeliverySearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm()
  const { filters, setFilters } = useReportDeliveryStore()
  const [collapsed, setCollapsed] = useState(true)

  const statusOptions: { value: ReportStatus; label: string }[] = [
    { value: 'allow', label: '允许下载' },
    { value: 'blocked', label: '卡报告' },
    { value: 'downloaded', label: '已下载' }
  ]

  useEffect(() => {
    form.setFieldsValue({
      reportNos: filters.reportNos?.join(', ') || '',
      orderNos: filters.orderNos?.join(', ') || '',
      customerNames: filters.customerNames?.join(', ') || '',
      sampleNos: filters.sampleNos?.join(', ') || '',
      productNames: filters.productNames?.join(', ') || '',
      statuses: filters.statuses || statusOptions.map(s => s.value),
      patientName: filters.patientName || '',
      patientPhone: filters.patientPhone || '',
      patientId: filters.patientId || ''
    })
  }, [filters, form])

  const handleSearch = () => {
    form.validateFields().then(v => {
      setFilters({
        reportNos: v.reportNos ? v.reportNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        orderNos: v.orderNos ? v.orderNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        customerNames: v.customerNames ? v.customerNames.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        sampleNos: v.sampleNos ? v.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        productNames: v.productNames ? v.productNames.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        statuses: v.statuses || undefined,
        patientName: v.patientName || undefined,
        patientPhone: v.patientPhone || undefined,
        patientId: v.patientId || undefined
      })
      onSearch()
    })
  }

  const handleReset = () => { form.resetFields(); onReset() }

  return (
    <Card title="查询条件" size="small" style={{ overflowX: 'hidden' }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="报告编号" name="reportNos">
              <Input placeholder="多个报告号用英文逗号分隔" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="订单编号" name="orderNos">
              <Input placeholder="多个订单号用英文逗号分隔" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="客户名称" name="customerNames">
              <Input placeholder="多个客户名用英文逗号分隔" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="样本编号" name="sampleNos">
              <Input placeholder="多个样本编号用英文逗号分隔" />
            </Form.Item>
          </Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="产品名称" name="productNames">
                  <Input placeholder="多个产品名称用英文逗号分隔" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="报告状态" name="statuses">
                  <Select mode="multiple" placeholder="请选择报告状态">
                    {statusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="患者姓名" name="patientName">
                  <Input placeholder="请输入患者姓名" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="患者手机号" name="patientPhone">
                  <Input placeholder="请输入患者手机号" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="患者ID" name="patientId">
                  <Input placeholder="请输入患者ID" />
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  )
}

export default DeliverySearchPanel
