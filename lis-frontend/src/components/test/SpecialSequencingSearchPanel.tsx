import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useSpecialSequencingStore, RunStatus } from '@/stores/specialSequencing';
const { RangePicker } = DatePicker; const { Option } = Select;
interface Props { onSearch: () => void; onReset: () => void; }
export const SpecialSequencingSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm(); const { filters, setFilters } = useSpecialSequencingStore(); const [collapsed, setCollapsed] = useState(true);
  const statusOptions: { value: RunStatus; label: string }[] = [ '待上机','运行中','暂停','结束','异常' ].map(s => ({ value: s as RunStatus, label: s }));
  useEffect(() => { form.setFieldsValue({ batchNos: filters.batchNos?.join(', ') || '', sampleNos: filters.sampleNos?.join(', ') || '', devices: filters.devices || undefined, statuses: filters.statuses || statusOptions.map(s => s.value) }); }, [filters, form]);
  const handleSearch = () => { form.validateFields().then(values => { const next = { batchNos: values.batchNos ? values.batchNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, sampleNos: values.sampleNos ? values.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, devices: values.devices || undefined, statuses: values.statuses || undefined, runRange: values.runRange ? [values.runRange[0].toDate().toISOString(), values.runRange[1].toDate().toISOString()] as [string, string] : undefined }; setFilters(next); onSearch(); }); };
  const handleReset = () => { form.resetFields(); onReset(); };
  return (
    <Card title="查询条件" size="small" styles={{ body: { padding: 16 } }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="批次编号" name="batchNos"><Input placeholder="多个批次号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="样本编号" name="sampleNos"><Input placeholder="多个样本号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="测序设备" name="devices"><Select mode="multiple" placeholder="请选择设备"><Option value="NovaSeq X">NovaSeq X</Option><Option value="MGI T7">MGI T7</Option></Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="上机状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (<Row gutter={16}><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="上机时间" name="runRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col></Row>)}
      </Form>
    </Card>
  );
};