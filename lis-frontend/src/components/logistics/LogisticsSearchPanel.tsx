import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useLogisticsStore, LogisticsStatus } from '@/stores/logistics';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void; }

const LogisticsSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useLogisticsStore();
  const [collapsed, setCollapsed] = useState(true);

  const statusOptions: { value: LogisticsStatus; label: string }[] = [
    { value: 'pending', label: '待发货' },
    { value: 'in_transit', label: '运输中' },
    { value: 'delivered', label: '已签收' },
    { value: 'exception', label: '异常' }
  ];

  useEffect(() => {
    form.setFieldsValue({
      waybillNos: filters.waybillNos?.join(', ') || '',
      orderNos: filters.orderNos?.join(', ') || '',
      companies: filters.companies || [],
      statuses: filters.statuses || statusOptions.map(s => s.value),
      shippedRange: null,
      authors: filters.authors?.join(', ') || ''
    });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(values => {
      setFilters({
        waybillNos: values.waybillNos ? values.waybillNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        orderNos: values.orderNos ? values.orderNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        companies: values.companies || undefined,
        statuses: values.statuses || undefined,
        shippedRange: values.shippedRange ? [values.shippedRange[0].toDate().toISOString(), values.shippedRange[1].toDate().toISOString()] : undefined,
        authors: values.authors ? values.authors.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
      });
      onSearch();
    });
  };

  const handleReset = () => {
    form.resetFields();
    onReset();
  };

  return (
    <Card title="查询条件" size="small" style={{ overflowX: 'hidden' }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="物流单号" name="waybillNos">
              <Input placeholder="多个物流单号用英文逗号分隔" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="订单编号" name="orderNos">
              <Input placeholder="多个订单号用英文逗号分隔" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="物流公司" name="companies">
              <Select mode="multiple" placeholder="请选择物流公司">
                {['顺丰','圆通','中通','申通','韵达','EMS','京东物流','德邦','自送样','其他'].map(c => (
                  <Option key={c} value={c}>{c}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="物流状态" name="statuses">
              <Select mode="multiple" placeholder="请选择物流状态">
                {statusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {!collapsed && (
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Item label="发货时间" name="shippedRange">
                <RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={['开始时间', '结束时间']}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Item label="填写人" name="authors">
                <Input placeholder="多个填写人用英文逗号分隔" />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Card>
  );
};

export default LogisticsSearchPanel;
