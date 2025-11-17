import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useEnvironmentStore, EnvStatus, ProtectionLevel } from '@/stores/environment';

const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void; }

/** 函数功能：环境管理查询条件面板组件；参数：查询与重置回调；返回值：React元素；用途：渲染查询条件区 */
export const EnvSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useEnvironmentStore();
  const [collapsed, setCollapsed] = useState(true);

  const statusOptions: EnvStatus[] = ['正常','异常'];
  const levelOptions: ProtectionLevel[] = ['一级','二级','三级'];

  useEffect(() => {
    form.setFieldsValue({
      roomNos: filters.roomNos?.join(', ') || '',
      roomLocationKeyword: filters.roomLocationKeyword || '',
      statuses: filters.statuses || statusOptions,
      protectionLevels: filters.protectionLevels || levelOptions
    });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        roomNos: values.roomNos ? values.roomNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        roomLocationKeyword: values.roomLocationKeyword || undefined,
        statuses: values.statuses || undefined,
        protectionLevels: values.protectionLevels || undefined
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
          <Col xs={24} sm={12} md={6}><Form.Item label="房间号" name="roomNos"><Input placeholder="多个房间号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="房间位置" name="roomLocationKeyword"><Input placeholder="请输入房间位置" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="防护等级" name="protectionLevels"><Select mode="multiple" placeholder="请选择防护等级">{levelOptions.map(l => (<Option key={l} value={l}>{l}</Option>))}</Select></Form.Item></Col>
        </Row>
      </Form>
    </Card>
  );
};

