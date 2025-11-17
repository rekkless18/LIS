import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useRoutineStore, ExperimentStatus, AuditStatus } from '@/stores/routine';
const { RangePicker } = DatePicker; const { Option } = Select;
interface RoutineSearchPanelProps { onSearch: () => void; onReset: () => void; }
export const RoutineSearchPanel: React.FC<RoutineSearchPanelProps> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm(); const { filters, setFilters } = useRoutineStore(); const [collapsed, setCollapsed] = useState(true);
  const statusOptions: { value: ExperimentStatus; label: string }[] = [ { value: 'pending', label: '待实验' }, { value: 'running', label: '进行中' }, { value: 'exception', label: '异常' }, { value: 'reviewing', label: '待审核' }, { value: 'reviewed', label: '已审核' }, { value: 'cancelled', label: '已取消' } ];
  const auditOptions: { value: AuditStatus; label: string }[] = [ { value: 'pending', label: '待审核' }, { value: 'approved', label: '已审核' }, { value: 'rejected', label: '不通过' } ];
  useEffect(() => { form.setFieldsValue({ sampleNos: filters.sampleNos?.join(', ') || '', statuses: filters.statuses || ['pending', 'running', 'exception', 'reviewing'], auditStatuses: filters.auditStatuses || undefined, startRange: undefined, endRange: undefined, auditRange: undefined, productIds: filters.productIds?.join(', ') || '' }); }, [filters, form]);
  const handleSearch = () => { form.validateFields().then(values => { const newFilters = { sampleNos: values.sampleNos ? values.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, productIds: values.productIds ? values.productIds.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined, statuses: values.statuses || undefined, auditStatuses: values.auditStatuses || undefined, startRange: values.startRange ? [values.startRange[0].toDate().toISOString(), values.startRange[1].toDate().toISOString()] as [string, string] : undefined, endRange: values.endRange ? [values.endRange[0].toDate().toISOString(), values.endRange[1].toDate().toISOString()] as [string, string] : undefined, auditRange: values.auditRange ? [values.auditRange[0].toDate().toISOString(), values.auditRange[1].toDate().toISOString()] as [string, string] : undefined }; setFilters(newFilters); onSearch(); }); };
  const handleReset = () => { form.resetFields(); onReset(); };
  return (
    <Card title="查询条件" size="small" style={{ overflowX: 'hidden' }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="样本编号" name="sampleNos" rules={[{ pattern: /^[a-zA-Z0-9,\s]*$/, message: '支持字母、数字、特殊字符' }]}><Input placeholder="多个样本号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="产品名称" name="productIds"><Input placeholder="请选择产品（输入产品名关键字）" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="实验状态" name="statuses"><Select mode="multiple" placeholder="请选择实验状态">{statusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="审核状态" name="auditStatuses"><Select mode="multiple" placeholder="请选择审核状态">{auditOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (<><Row gutter={16}><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="开始时间" name="startRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="完成时间" name="endRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col><Col xs={24} sm={12} md={6} lg={6} xl={6}><Form.Item label="审核时间" name="auditRange"><RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={["开始时间","结束时间"]} /></Form.Item></Col></Row></>)}
      </Form>
    </Card>
  );
};
