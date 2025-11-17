import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button, Space, message } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useOrderStore, OrderStatus, OrderFilters } from '@/stores/order';
import { CustomerSelectModal } from '../modals/CustomerSelectModal';
import { ProductSelectModal } from '../modals/ProductSelectModal';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface OrderSearchPanelProps {
  onSearch: () => void;
  onReset: () => void;
}

export const OrderSearchPanel: React.FC<OrderSearchPanelProps> = ({ onSearch, onReset }) => {
  const [form] = Form.useForm();
  const { filters, setFilters } = useOrderStore();
  const [collapsed, setCollapsed] = useState(true);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'processing', label: '交付中' },
    { value: 'partially_completed', label: '部分完成' },
    { value: 'completed', label: '全部完成' }
  ];

  useEffect(() => {
    // Initialize form with current filters
    form.setFieldsValue({
      orderNos: filters.orderNos?.join(', ') || '',
      sampleNos: filters.sampleNos?.join(', ') || '',
      patientName: filters.patientName || '',
      patientPhone: filters.patientPhone || '',
      patientId: filters.patientId || '',
      createdBy: filters.createdBy?.join(', ') || '',
      statuses: filters.statuses || ['processing', 'partially_completed', 'completed'],
      dateRange: null
    });
  }, [filters, form]);

  const handleSearch = () => {
    form.validateFields().then(values => {
      const newFilters: Partial<OrderFilters> = {
        orderNos: values.orderNos ? values.orderNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        sampleNos: values.sampleNos ? values.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        patientName: values.patientName || undefined,
        patientPhone: values.patientPhone || undefined,
        patientId: values.patientId || undefined,
        createdBy: values.createdBy ? values.createdBy.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        statuses: values.statuses || undefined,
        dateRange: values.dateRange ? [
          values.dateRange[0].toDate().toISOString(),
          values.dateRange[1].toDate().toISOString()
        ] as [string, string] : undefined,
        customerIds: selectedCustomers.length > 0 ? selectedCustomers : undefined,
        productIds: selectedProducts.length > 0 ? selectedProducts : undefined
      };

      setFilters(newFilters);
      onSearch();
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedCustomers([]);
    setSelectedProducts([]);
    onReset();
  };

  const handleCustomerSelect = (customerIds: string[]) => {
    setSelectedCustomers(customerIds);
  };

  const handleProductSelect = (productIds: string[]) => {
    setSelectedProducts(productIds);
  };

  const handleStatusChange = (statuses: OrderStatus[]) => {
    form.setFieldValue('statuses', statuses);
  };

  const handleSelectAllStatus = () => {
    const allStatuses = statusOptions.map(s => s.value);
    form.setFieldValue('statuses', allStatuses);
  };

  const handleDeselectAllStatus = () => {
    form.setFieldValue('statuses', []);
  };

  return (
    <>
      <Card 
        title="查询条件" 
        size="small"
        style={{ overflowX: 'hidden' }}
        extra={
          <Button 
            type="link" 
            icon={collapsed ? <DownOutlined /> : <UpOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '展开' : '收起'}
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            statuses: ['processing', 'partially_completed', 'completed']
          }}
        >
          <Row gutter={16}>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item
                  label="订单编号"
                  name="orderNos"
                  rules={[{ pattern: /^[a-zA-Z0-9,\s]*$/, message: '支持字母、数字、特殊字符' }]}
                >
                  <Input placeholder="多个订单号用英文逗号分隔" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="客户名称" name="customerIds">
                  <Input
                    placeholder="请选择客户"
                    readOnly
                    value={selectedCustomers.length > 0 ? `已选择 ${selectedCustomers.length} 个客户` : ''}
                    onClick={() => setCustomerModalVisible(true)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item
                  label="样本编号"
                  name="sampleNos"
                  rules={[{ pattern: /^[a-zA-Z0-9,\s]*$/, message: '支持字母、数字、特殊字符' }]}
                >
                  <Input placeholder="多个订单号用英文逗号分隔" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Form.Item label="产品名称" name="productIds">
                  <Input
                    placeholder="请选择产品"
                    readOnly
                    value={selectedProducts.length > 0 ? `已选择 ${selectedProducts.length} 个产品` : ''}
                    onClick={() => setProductModalVisible(true)}
                  />
                </Form.Item>
              </Col>
          </Row>
          {!collapsed && (
            <>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item label="订单状态" name="statuses">
                    <Select
                      mode="multiple"
                      placeholder="请选择订单状态"
                      onChange={handleStatusChange}
                      popupRender={menu => (
                        <div>
                          {menu}
                          <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                            <Button type="link" size="small" onClick={handleSelectAllStatus}>
                              全选
                            </Button>
                            <Button type="link" size="small" onClick={handleDeselectAllStatus}>
                              取消全选
                            </Button>
                          </div>
                        </div>
                      )}
                    >
                      {statusOptions.map(status => (
                        <Option key={status.value} value={status.value}>
                          {status.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item label="订单创建时间" name="dateRange">
                    <RangePicker
                      showTime={{ format: 'HH:mm:ss' }}
                      format="YYYY-MM-DD HH:mm:ss"
                      placeholder={['开始时间', '结束时间']}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item
                    label="患者姓名"
                    name="patientName"
                    rules={[{ pattern: /^[\u4e00-\u9fa5a-zA-Z\s]*$/, message: '支持中文、英文' }]}
                  >
                    <Input placeholder="请输入患者姓名" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item
                    label="患者手机号"
                    name="patientPhone"
                    rules={[{ pattern: /^\d*$/, message: '支持数字' }]}
                  >
                    <Input placeholder="请输入患者手机号" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item
                    label="患者ID"
                    name="patientId"
                    rules={[{ pattern: /^[a-zA-Z0-9]*$/, message: '支持字母、数字' }]}
                  >
                    <Input placeholder="请输入患者ID" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item
                    label="录入人"
                    name="createdBy"
                    rules={[{ pattern: /^[a-zA-Z0-9,\s]*$/, message: '支持字母、数字、特殊字符' }]}
                  >
                    <Input placeholder="多个录入人用英文逗号分隔" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </Card>

      <CustomerSelectModal
        visible={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        onSelect={handleCustomerSelect}
        selectedCustomers={selectedCustomers}
        multiple={true}
      />

      <ProductSelectModal
        visible={productModalVisible}
        onCancel={() => setProductModalVisible(false)}
        onSelect={handleProductSelect}
        selectedProducts={selectedProducts}
        multiple={true}
      />
    </>
  );
};
