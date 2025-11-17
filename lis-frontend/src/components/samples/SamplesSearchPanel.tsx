import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useSampleStore, SampleStatus } from '@/stores/samples';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void; }

const SamplesSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useSampleStore();
  const [collapsed, setCollapsed] = useState(true);

  const statusOptions: { value: SampleStatus; label: string }[] = [
    { value: 'not_received', label: '未接收' },
    { value: 'received', label: '已接收' },
    { value: 'destroyed', label: '已销毁' },
    { value: 'frozen', label: '已冻存' }
  ];

  useEffect(() => {
    form.setFieldsValue({
      orderNos: filters.orderNos?.join(', ') || '',
      sampleNos: filters.sampleNos?.join(', ') || '',
      productIds: filters.productIds || [],
      statuses: filters.statuses || statusOptions.map(s => s.value),
      abnormal: filters.abnormal || 'normal',
      storageLocation: filters.storageLocation || '',
      storageBoxIds: filters.storageBoxIds?.join(', ') || '',
      receiveRange: null
    });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(v => {
      setFilters({
        orderNos: v.orderNos ? v.orderNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        sampleNos: v.sampleNos ? v.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        productIds: v.productIds || undefined,
        statuses: v.statuses || undefined,
        abnormal: v.abnormal || undefined,
        storageLocation: v.storageLocation || undefined,
        storageBoxIds: v.storageBoxIds ? v.storageBoxIds.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        receiveRange: v.receiveRange ? [v.receiveRange[0].toDate().toISOString(), v.receiveRange[1].toDate().toISOString()] : undefined
      });
      onSearch();
    });
  };

  const handleReset = () => { form.resetFields(); onReset(); };

  return (
    <Card title="查询条件" size="small" style={{ overflowX: 'hidden' }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="订单编号" name="orderNos">
              <Input placeholder="多个订单号用英文逗号分隔" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="样本编号" name="sampleNos">
              <Input placeholder="多个样本编号用英文逗号分隔" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="产品名称" name="productIds">
              <Select mode="multiple" placeholder="请选择产品"></Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6} lg={6} xl={6}>
            <Form.Item label="样本状态" name="statuses">
              <Select mode="multiple" placeholder="请选择样本状态">
                {statusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="样本异常状态" name="abnormal">
                  <Select>
                    <Option value="normal">正常</Option>
                    <Option value="abnormal">异常</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="存储位置" name="storageLocation">
                  <Input placeholder="请输入存储位置" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="存储盒ID" name="storageBoxIds">
                  <Input placeholder="多个存储盒用英文逗号分隔" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="接收时间" name="receiveRange">
                  <RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={['开始时间', '结束时间']}/>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  );
};

export default SamplesSearchPanel;
