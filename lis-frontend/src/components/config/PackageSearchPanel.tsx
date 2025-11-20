import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { usePackageConfigStore, PackageType, EnableStatus } from '@/stores/configPackage';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Props { onSearch: () => void; onReset: () => void }

export const PackageSearchPanel: React.FC<Props> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = usePackageConfigStore();
  const [collapsed, setCollapsed] = useState(true);
  const typeOptions: PackageType[] = ['常规套餐','科研套餐','VIP套餐'];
  const statusOptions: EnableStatus[] = ['启用','禁用'];
  const [productOptions, setProductOptions] = useState<{ id: string, product_name: string }[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  /**
   * 功能描述：加载已启用的产品名称作为下拉选项
   * 参数说明：无
   * 返回值类型及用途：无；更新本地选项状态
   */
  const loadEnabledProducts = async () => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
    try {
      const resp = await fetch(`${API_BASE}/products/enabled`);
      if (!resp.ok) { setProductOptions([]); return; }
      const json = await resp.json();
      const raw = Array.isArray(json) ? json : (json?.data || []);
      const mapped = (raw || []).map((p: any) => ({ id: p.id, product_name: p.product_name ?? p.productName })).filter((p: any) => p.product_name);
      setProductOptions(mapped);
      setProductsLoaded(true);
    } catch { setProductOptions([]); }
  };

  useEffect(() => {
    form.setFieldsValue({
      codes: filters.codes?.join(', ') || '',
      nameKeyword: filters.nameKeyword || '',
      types: filters.types || typeOptions,
      productNames: filters.productNames || [],
      statuses: filters.statuses || statusOptions,
      createdRange: undefined
    });
  }, [filters, form]);


  const handleSearch = () => {
    form.validateFields().then(values => {
      const next = {
        codes: values.codes ? values.codes.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        nameKeyword: values.nameKeyword || undefined,
        types: values.types || undefined,
        productNames: values.productNames || undefined,
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
          <Col xs={24} sm={12} md={6}><Form.Item label="套餐编码" name="codes"><Input placeholder="多个套餐编码用英文逗号分隔" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="套餐名称" name="nameKeyword"><Input placeholder="请输入套餐名称" /></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="套餐类型" name="types"><Select mode="multiple" placeholder="请选择套餐类型">{typeOptions.map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
          <Col xs={24} sm={12} md={6}><Form.Item label="状态" name="statuses"><Select mode="multiple" placeholder="请选择状态">{statusOptions.map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item></Col>
        </Row>
        {!collapsed && (
          <>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}><Form.Item label="产品名称" name="productNames"><Select mode="multiple" placeholder="请选择产品" onDropdownVisibleChange={(open) => { if (open && !productsLoaded) loadEnabledProducts(); }}>{productOptions.map(p => (<Option key={p.id} value={p.product_name}>{p.product_name}</Option>))}</Select></Form.Item></Col>
              <Col xs={24} sm={12} md={6}><Form.Item label="创建日期" name="createdRange"><RangePicker format="YYYY-MM-DD" placeholder={["开始日期","结束日期"]} /></Form.Item></Col>
            </Row>
          </>
        )}
      </Form>
    </Card>
  );
};

