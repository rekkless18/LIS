import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useEquipmentStore, DeviceType, DeviceStatus } from '@/stores/equipment';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void; }

/** 函数功能：设备管理查询条件面板组件；参数：查询与重置回调；返回值：React元素；用途：渲染查询条件区 */
export const EquipSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useEquipmentStore();
  const [collapsed, setCollapsed] = useState(true);

  const typeOptions: DeviceType[] = ['测序仪','QPCR仪','离心机','培养箱','生化仪器','质谱仪器','血液仪器','冰箱','其他'];
  const statusOptions: DeviceStatus[] = ['运行','关机','维护','故障','报废'];
  const userOptions = ['张三','李四','王五','赵六'];

  useEffect(() => {
    form.setFieldsValue({
      deviceNos: filters.deviceNos?.join(', ') || '',
      deviceNameKeyword: filters.deviceNameKeyword || '',
      deviceTypes: filters.deviceTypes || typeOptions,
      statuses: filters.statuses || statusOptions,
      locationKeyword: filters.locationKeyword || '',
      manufacturerKeyword: filters.manufacturerKeyword || '',
      owners: filters.owners || []
    });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        deviceNos: values.deviceNos ? values.deviceNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        deviceNameKeyword: values.deviceNameKeyword || undefined,
        deviceTypes: values.deviceTypes || undefined,
        statuses: values.statuses || undefined,
        locationKeyword: values.locationKeyword || undefined,
        manufacturerKeyword: values.manufacturerKeyword || undefined,
        purchaseRange: values.purchaseRange ? [values.purchaseRange[0].toDate().toISOString(), values.purchaseRange[1].toDate().toISOString()] as [string, string] : undefined,
        maintenanceRange: values.maintenanceRange ? [values.maintenanceRange[0].toDate().toISOString(), values.maintenanceRange[1].toDate().toISOString()] as [string, string] : undefined,
        scrapRange: values.scrapRange ? [values.scrapRange[0].toDate().toISOString(), values.scrapRange[1].toDate().toISOString()] as [string, string] : undefined,
        owners: values.owners || undefined
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
          <Col xs={24} sm={12} md={6}><Form.Item label="设备编号" name="deviceNos"><Input placeholder="多个设备编号用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="设备名称" name="deviceNameKeyword"><Input placeholder="请输入设备名称" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="设备类型" name="deviceTypes"><Select mode="multiple" placeholder="请选择设备类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="设备状态" name="statuses"><Select mode="multiple" placeholder="请选择设备状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="设备位置" name="locationKeyword"><Input placeholder="请输入设备位置" /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="生产厂家" name="manufacturerKeyword"><Input placeholder="请输入生产厂家名称" /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="购置日期" name="purchaseRange"><RangePicker format="YYYY-MM-DD" placeholder={["开始日期","结束日期"]} /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="上次维护日期" name="maintenanceRange"><RangePicker format="YYYY-MM-DD" placeholder={["开始日期","结束日期"]} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="报废日期" name="scrapRange"><RangePicker format="YYYY-MM-DD" placeholder={["开始日期","结束日期"]} /></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="责任人" name="owners"><Select mode="multiple" placeholder="请选择责任人" showSearch>{userOptions.map(u => (<Option key={u} value={u}>{u}</Option>))}</Select></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  );
};

