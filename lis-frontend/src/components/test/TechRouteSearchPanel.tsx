import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTechRouteStore, TechRouteStatus } from '@/stores/techRoute';
const { RangePicker } = DatePicker; const { Option } = Select;
interface Props { onSearch: () => void; onReset: () => void; }
export const TechRouteSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm(); const { filters, setFilters } = useTechRouteStore(); const [collapsed, setCollapsed] = useState(true);
  const statusOptions: { value: TechRouteStatus; label: string }[] = [ { value: '待确认', label: '待确认' }, { value: '已确认', label: '已确认' }, { value: '退回', label: '退回' } ];
  useEffect(() => { form.setFieldsValue({ sampleNos: filters.sampleNos?.join(', ') || '', productIds: filters.productIds?.join(', ') || '', routeIds: filters.routeIds?.join(', ') || '', statuses: filters.statuses || statusOptions.map(s => s.value) }); }, [filters, form]);
  const handleSearch = () => { form.validateFields().then(values => { const next = { sampleNos: values.sampleNos ? values.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, productIds: values.productIds ? values.productIds.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, routeIds: values.routeIds ? values.routeIds.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, statuses: values.statuses || undefined, arriveRange: values.arriveRange ? [values.arriveRange[0].toDate().toISOString(), values.arriveRange[1].toDate().toISOString()] as [string, string] : undefined, confirmRange: values.confirmRange ? [values.confirmRange[0].toDate().toISOString(), values.confirmRange[1].toDate().toISOString()] as [string, string] : undefined }; setFilters(next); onSearch(); }); };
  const handleReset = () => { form.resetFields(); onReset(); };
  return (
    <Card title="查询条件" size="small" styles={{ body: { padding: 16 } }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="样本编号" name="sampleNos"><Input placeholder="多个样本号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="产品名称" name="productIds"><Input placeholder="点击选择产品或输入关键字" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="技术路线名称" name="routeIds"><Input placeholder="点击选择技术路线或输入关键字" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (<><Row gutter={16}><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="到样时间" name="arriveRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="确认时间" name="confirmRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col></Row></>)}
      </Form>
    </Card>
  );
};
