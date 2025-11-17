import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useRoutineExceptionStore, ExceptionType, ExceptionStatus } from '@/stores/routineException';
const { RangePicker } = DatePicker; const { Option } = Select;
interface Props { onSearch: () => void; onReset: () => void; }
export const RoutineExceptionSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm(); const { filters, setFilters } = useRoutineExceptionStore(); const [collapsed, setCollapsed] = useState(true);
  const typeOptions: { value: ExceptionType; label: string }[] = [ { value: '设备故障', label: '设备故障' }, { value: '试剂异常', label: '试剂异常' }, { value: '样本异常', label: '样本异常' }, { value: '操作异常', label: '操作异常' } ];
  const statusOptions: { value: ExceptionStatus; label: string }[] = [ { value: '待处理', label: '待处理' }, { value: '处理中', label: '处理中' }, { value: '已解决', label: '已解决' }, { value: '已关闭', label: '已关闭' } ];
  useEffect(() => { form.setFieldsValue({ exceptionNos: filters.exceptionNos?.join(', ') || '', experimentNos: filters.experimentNos?.join(', ') || '', sampleNos: filters.sampleNos?.join(', ') || '', productIds: filters.productIds?.join(', ') || '', testItemIds: filters.testItemIds?.join(', ') || '', types: filters.types || typeOptions.map(t => t.value), statuses: filters.statuses || statusOptions.map(s => s.value), discoverers: filters.discoverers?.join(', ') || '', handlers: filters.handlers?.join(', ') || '' }); }, [filters, form]);
  const handleSearch = () => { form.validateFields().then(values => { const next = { exceptionNos: values.exceptionNos ? values.exceptionNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, experimentNos: values.experimentNos ? values.experimentNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, sampleNos: values.sampleNos ? values.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, productIds: values.productIds ? values.productIds.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, testItemIds: values.testItemIds ? values.testItemIds.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, types: values.types || undefined, statuses: values.statuses || undefined, discoverers: values.discoverers ? values.discoverers.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, handlers: values.handlers ? values.handlers.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, discoverRange: values.discoverRange ? [values.discoverRange[0].toDate().toISOString(), values.discoverRange[1].toDate().toISOString()] as [string, string] : undefined, handleRange: values.handleRange ? [values.handleRange[0].toDate().toISOString(), values.handleRange[1].toDate().toISOString()] as [string, string] : undefined }; setFilters(next); onSearch(); }); };
  const handleReset = () => { form.resetFields(); onReset(); };
  return (
    <Card title="查询条件" size="small" styles={{ body: { padding: 16 } }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="异常编号" name="exceptionNos"><Input placeholder="多个异常号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="实验编号" name="experimentNos"><Input placeholder="多个实验号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="样本编号" name="sampleNos"><Input placeholder="多个样本号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="产品名称" name="productIds"><Input placeholder="点击选择产品或输入关键字" /></Form.Item></Col>
        </Row>
        {!collapsed && (<><Row gutter={16}><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="检测项名称" name="testItemIds"><Input placeholder="点击选择检测项或输入关键字" /></Form.Item></Col><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="异常类型" name="types"><Select mode="multiple" placeholder="请选择异常类型">{typeOptions.map(t => (<Option key={t.value} value={t.value}>{t.label}</Option>))}</Select></Form.Item></Col><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="异常状态" name="statuses"><Select mode="multiple" placeholder="请选择异常状态">{statusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}</Select></Form.Item></Col><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="发现人" name="discoverers"><Input placeholder="多个发现人用英文逗号分隔" /></Form.Item></Col></Row><Row gutter={16}><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="处理人" name="handlers"><Input placeholder="多个处理人用英文逗号分隔" /></Form.Item></Col><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="发现时间" name="discoverRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="处理时间" name="handleRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col></Row></>)}
      </Form>
    </Card>
  );
};
