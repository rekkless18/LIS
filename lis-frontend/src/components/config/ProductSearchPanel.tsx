import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useProductConfigStore, ProductType, EnableStatus } from '@/stores/configProduct';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void }

export const ProductSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useProductConfigStore();
  const [collapsed, setCollapsed] = useState(true);
  const typeOptions: ProductType[] = ['普检产品','特检产品','质谱产品','研发产品','其他产品'];
  const statusOptions: EnableStatus[] = ['启用','禁用'];

  useEffect(() => {
    form.setFieldsValue({ codes: filters.codes?.join(', ') || '', nameKeyword: filters.nameKeyword || '', types: filters.types || typeOptions, statuses: filters.statuses || statusOptions, createdRange: undefined });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        codes: values.codes ? values.codes.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        nameKeyword: values.nameKeyword || undefined,
        types: values.types || undefined,
        statuses: values.statuses || undefined,
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
          <Col xs={24} sm={12} md={6}><Form.Item label="产品编码" name="codes"><Input placeholder="多个产品编码用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="产品名称" name="nameKeyword"><Input placeholder="请输入产品名称" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="产品类型" name="types"><Select mode="multiple" placeholder="请选择产品类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdRange"><RangePicker format="YYYY-MM-DD" placeholder={["开始日期","结束日期"]} /></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  );
};

