import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useMsExceptionStore, MsExceptionStatus } from '@/stores/msException';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void; }

export const MsExceptionSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useMsExceptionStore();
  const [collapsed, setCollapsed] = useState(true);

  const statusOptions: { value: MsExceptionStatus; label: string }[] = ['待处理','已重测','已提交'].map(s => ({ value: s as MsExceptionStatus, label: s }));

  useEffect(() => {
    form.setFieldsValue({
      sampleNos: filters.sampleNos?.join(', ') || '',
      productIds: filters.productIds?.join(', ') || '',
      statuses: filters.statuses || statusOptions.map(s => s.value)
    });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        sampleNos: values.sampleNos ? values.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        productIds: values.productIds ? values.productIds.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        statuses: values.statuses || undefined,
        startRange: values.startRange ? [values.startRange[0].toDate().toISOString(), values.startRange[1].toDate().toISOString()] as [string, string] : undefined,
        endRange: values.endRange ? [values.endRange[0].toDate().toISOString(), values.endRange[1].toDate().toISOString()] as [string, string] : undefined,
        retestRange: values.retestRange ? [values.retestRange[0].toDate().toISOString(), values.retestRange[1].toDate().toISOString()] as [string, string] : undefined
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
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="样本编号" name="sampleNos"><Input placeholder="多个样本号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="产品名称" name="productIds"><Input placeholder="请选择产品或输入关键字" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="异常状态" name="statuses"><Select mode="multiple" placeholder="请选择异常状态">{statusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="开始时间" name="startRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="完成时间" name="endRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="重测时间" name="retestRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  );
};
