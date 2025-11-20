import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useTestItemConfigStore, TestItemType, JudgeType, EnableStatus } from '@/stores/configTestItem';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void }

export const TestItemSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useTestItemConfigStore();
  const [collapsed, setCollapsed] = useState(true);
  const typeOptions: TestItemType[] = ['普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项'];
  const judgeOptions: JudgeType[] = ['上限','下限','上下限','定性','阴阳性','聚合'];
  const statusOptions: EnableStatus[] = ['启用','禁用'];

  useEffect(() => {
    form.setFieldsValue({
      codes: filters.codes?.join(', ') || '',
      nameKeyword: filters.nameKeyword || '',
      itemTypes: undefined,
      judgeTypes: undefined,
      statuses: filters.statuses || statusOptions,
      createdRange: undefined
    });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        codes: values.codes ? values.codes.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        nameKeyword: values.nameKeyword || undefined,
        itemTypes: values.itemTypes ? [values.itemTypes] as TestItemType[] : undefined,
        judgeTypes: values.judgeTypes ? [values.judgeTypes] as JudgeType[] : undefined,
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
          <Col xs={24} sm={12} md={6}><Form.Item label="检测项编码" name="codes"><Input placeholder="多个检测项编码用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="检测项名称" name="nameKeyword"><Input placeholder="请输入检测项名称" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="检测项类型" name="itemTypes"><Select placeholder="请选择检测项类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="结果判断类型" name="judgeTypes"><Select placeholder="请选择结果判断类型">{judgeOptions.map(j => (<Option key={j} value={j}>{j}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdRange"><RangePicker format="YYYY-MM-DD" placeholder={["开始日期","结束日期"]} /></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  );
};

