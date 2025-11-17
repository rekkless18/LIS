import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Form, Input, Select, DatePicker, Button, Tooltip, Table } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { useSampleProgressStore, SampleStatus, DeliveryStatus } from '@/stores/sampleProgress';
import { PaginationBar } from '@/components/order/PaginationBar';
import { CustomerSelectModal } from '@/components/modals/CustomerSelectModal';
import { ProductSelectModal } from '@/components/modals/ProductSelectModal';
import { useNavigate } from 'react-router-dom';
import { maskName, maskPhone } from '@/stores/order';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SampleProgress: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { filtered, selectedRowKeys, setSelectedRowKeys, query, resetFilters, setFilters, setPagination, pagination } = useSampleProgressStore();
  const [collapsed, setCollapsed] = useState(true);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const sampleStatusOptions: { value: SampleStatus; label: string }[] = [
    { value: 'not_received', label: '未接收' },
    { value: 'received', label: '已接收' },
    { value: 'destroyed', label: '已销毁' },
    { value: 'frozen', label: '已冻存' }
  ];

  const deliveryStatusOptions: { value: DeliveryStatus; label: string }[] = [
    { value: 'not_started', label: '未开始' },
    { value: 'in_lab', label: '实验中' },
    { value: 'reported', label: '已出报告' },
    { value: 'delivered', label: '已交付' }
  ];

  useEffect(() => { query(); }, []);

  const handleSearch = () => {
    form.validateFields().then(v => {
      setFilters({
        orderNos: v.orderNos ? v.orderNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        customerNames: selectedCustomers.length ? selectedCustomers : undefined,
        sampleNos: v.sampleNos ? v.sampleNos.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined,
        productNames: selectedProducts.length ? selectedProducts : undefined,
        sampleStatuses: v.sampleStatuses || undefined,
        deliveryStatuses: v.deliveryStatuses || undefined,
        orderCreatedRange: v.orderCreatedRange ? [v.orderCreatedRange[0].toDate().toISOString(), v.orderCreatedRange[1].toDate().toISOString()] : undefined,
        patientName: v.patientName || undefined,
        patientPhone: v.patientPhone || undefined,
        patientId: v.patientId || undefined,
        createdBy: v.createdBy ? v.createdBy.split(',').map((s: string) => s.trim()).filter(Boolean) : undefined
      });
      query();
    });
  };

  const handleReset = () => { form.resetFields(); setSelectedCustomers([]); setSelectedProducts([]); resetFilters(); query(); };
  const handlePageChange = (p: number, s: number) => { setPagination({ current: p, pageSize: s }); query(); };

  const handleCustomerSelect = (ids: string[]) => { setSelectedCustomers(ids); };
  const handleProductSelect = (ids: string[]) => { setSelectedProducts(ids); };

  const goDetail = (item: any) => {
    const oid = item.orderId ?? item.id;
    const otype = item.orderType ?? (item.packageName ? 'package' : 'product');
    if (!oid || !otype) return;
    if (otype === 'product') navigate(`/order/product/${oid}`);
    else navigate(`/order/package/${oid}`);
  };

  return (
    <div className="h-full flex flex-col">
      <Card title="查询条件" size="small" style={{ overflowX: 'hidden' }} extra={<Button type="link" icon={collapsed ? <DownOutlined /> : <UpOutlined />} onClick={() => setCollapsed(!collapsed)}>{collapsed ? '展开' : '收起'}</Button>}>
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Item label="订单编号" name="orderNos">
                <Input placeholder="多个订单号用英文逗号分隔" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Item label="客户名称" name="customerIds">
                <Input placeholder="请选择客户" readOnly value={selectedCustomers.length ? `已选择 ${selectedCustomers.length} 个客户` : ''} onClick={() => setCustomerModalVisible(true)} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Item label="样本编号" name="sampleNos">
                <Input placeholder="多个订单号用英文逗号分隔" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={6} xl={6}>
              <Form.Item label="产品名称" name="productIds">
                <Input placeholder="请选择产品" readOnly value={selectedProducts.length ? `已选择 ${selectedProducts.length} 个产品` : ''} onClick={() => setProductModalVisible(true)} />
              </Form.Item>
            </Col>
          </Row>
          {!collapsed && (
            <>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item label="样本状态" name="sampleStatuses">
                    <Select mode="multiple" placeholder="请选择样本状态">
                      {sampleStatusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item label="交付状态" name="deliveryStatuses">
                    <Select mode="multiple" placeholder="请选择交付状态">
                      {deliveryStatusOptions.map(s => (<Option key={s.value} value={s.value}>{s.label}</Option>))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item label="订单创建时间" name="orderCreatedRange">
                    <RangePicker showTime={{ format: 'HH:mm:ss' }} format="YYYY-MM-DD HH:mm:ss" placeholder={['开始时间','结束时间']} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item label="患者姓名" name="patientName">
                    <Input placeholder="请输入患者姓名" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                  <Form.Item label="患者手机号" name="patientPhone">
                    <Input placeholder="请输入患者手机号" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="患者ID" name="patientId">
                    <Input placeholder="请输入患者ID" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="录入人" name="createdBy">
                    <Input placeholder="多个录入人用英文逗号分隔" />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
        </Form>
      </Card>

      <div className="bg-white p-4 border-b border-gray-200 flex justify-end">
        <Button className="mr-2" onClick={handleReset}>重置</Button>
        <Button type="primary" onClick={handleSearch}>查询</Button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {(() => {
          const columns = [
            { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
            { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 160, fixed: 'left', render: (t: string, r: any) => (
              <Tooltip title={t}><span className="cursor-pointer text-blue-600 hover:text-blue-800 truncate block max-w-40" onClick={() => goDetail(r)}>{t}</span></Tooltip>
            ) },
            { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
            { title: '样本编号', dataIndex: 'sampleNos', key: 'sampleNos', width: 200, render: (arr: string[]) => { const text = arr.join(', '); return (<Tooltip title={text}><span className="truncate block max-w-52">{text}</span></Tooltip>); } },
            { title: '产品名称', dataIndex: 'productNames', key: 'productNames', width: 200, render: (arr: string[]) => { const text = arr.join(', '); return (<Tooltip title={text}><span className="truncate block max-w-52">{text}</span></Tooltip>); } },
            { title: '套餐名称', dataIndex: 'packageName', key: 'packageName', width: 160, render: (t: string, r: any) => { const text = r.orderType === 'package' ? (t || '') : ''; return (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>); } },
            { title: '样本类型', dataIndex: 'sampleTypes', key: 'sampleTypes', width: 160, render: (arr: string[]) => { const text = arr.join(', '); return (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>); } },
            { title: '采样时间', dataIndex: 'samplingTime', key: 'samplingTime', width: 160, render: (t: string) => { const d = new Date(t); const s = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`; return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } },
            { title: '样本状态', dataIndex: 'sampleStatus', key: 'sampleStatus', width: 120, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-20">{t}</span></Tooltip>) },
            { title: '交付状态', dataIndex: 'deliveryStatus', key: 'deliveryStatus', width: 120, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-20">{t}</span></Tooltip>) },
            { title: '订单创建时间', dataIndex: 'orderCreatedAt', key: 'orderCreatedAt', width: 160, render: (t: string) => { const d = new Date(t); const s = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`; return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } },
            { title: '患者姓名', dataIndex: 'patientName', key: 'patientName', width: 120, render: (t: string) => { const masked = maskName(t); return (<Tooltip title={t}><span className="truncate block max-w-20">{masked}</span></Tooltip>); } },
            { title: '患者手机号', dataIndex: 'patientPhone', key: 'patientPhone', width: 120, render: (t: string) => { const masked = maskPhone(t); return (<Tooltip title={t}><span className="truncate block max-w-20">{masked}</span></Tooltip>); } },
            { title: '患者ID', dataIndex: 'patientId', key: 'patientId', width: 160, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
            { title: '录入人', dataIndex: 'createdBy', key: 'createdBy', width: 120, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-20">{t}</span></Tooltip>) },
          ];
          const totalWidth = columns.reduce((sum, col: any) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
          return (
            <Table
              rowKey="id"
              rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys as string[]) }}
              columns={columns as any}
              dataSource={filtered}
              scroll={{ x: totalWidth }}
              pagination={false}
            />
          );
        })()}
      </div>

      <div className="px-4">
        <PaginationBar onPageChange={handlePageChange} />
      </div>

      <CustomerSelectModal visible={customerModalVisible} onCancel={() => setCustomerModalVisible(false)} onSelect={handleCustomerSelect} selectedCustomers={selectedCustomers} multiple={true} />
      <ProductSelectModal visible={productModalVisible} onCancel={() => setProductModalVisible(false)} onSelect={handleProductSelect} selectedProducts={selectedProducts} multiple={true} />
    </div>
  );
};

export default SampleProgress;
