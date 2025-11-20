import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useCustomerConfigStore, CustomerType, Region, EnableStatus } from '@/stores/configCustomer';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void }

export const CustomerSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useCustomerConfigStore();
  const [collapsed, setCollapsed] = useState(true);
  const typeOptions: CustomerType[] = ['企业客户','高校客户','科研客户'];
  const regionOptions: Region[] = ['大陆','港澳台','西欧','东南亚','中东','北美','其他'];
  const statusOptions: EnableStatus[] = ['启用','禁用'];

  useEffect(() => {
    form.setFieldsValue({
      codes: filters.codes?.join(', ') || '',
      nameKeyword: filters.nameKeyword || '',
      types: filters.types?.[0] || undefined,
      regions: filters.regions?.[0] || undefined,
      statuses: filters.statuses?.[0] || undefined,
      createdRange: undefined
    });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        codes: values.codes ? values.codes.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        nameKeyword: values.nameKeyword || undefined,
        types: values.types ? [values.types as CustomerType] : undefined,
        regions: values.regions ? [values.regions as Region] : undefined,
        statuses: values.statuses ? [values.statuses as EnableStatus] : undefined,
        createdRange: values.createdRange ? [values.createdRange[0].toDate().toISOString(), values.createdRange[1].toDate().toISOString()] as [string, string] : undefined
      };
      setFilters(next);
      onSearch();
    });
  };

  const handleReset = () => { form.resetFields(); onReset(); };

  return (
    <Card title="查询条件" size="small" styles={{ body: { padding: 16 } }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}><Form.Item label="客户编码" name="codes"><Input placeholder="多个客户编码用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="客户名称" name="nameKeyword"><Input placeholder="请输入客户名称" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="客户类型" name="types"><Select placeholder="请选择客户类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="区域" name="regions"><Select placeholder="请选择区域">{regionOptions.map(r => (<Option key={r} value={r}>{r}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="状态" name="statuses"><Select placeholder="请选择状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdRange"><RangePicker format="YYYY-MM-DD" /></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  );
};

