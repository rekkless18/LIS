import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Row, Col, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/stores/order';
import { CustomerSelectModal } from '@/components/modals/CustomerSelectModal';
import { ProductSelectModal } from '@/components/modals/ProductSelectModal';
// @ts-ignore
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ProductNew: React.FC = () => {
  const navigate = useNavigate();
  const { createOrder } = useOrderStore();
  const [form] = Form.useForm();
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const mockCustomers = [
    { id: '1', name: '北京协和医院', code: 'PUMCH001', country: '中国', province: '北京', region: '东城区', contractNo: 'CON2024001' },
    { id: '2', name: '上海瑞金医院', code: 'RJH001', country: '中国', province: '上海', region: '黄浦区', contractNo: 'CON2024002' },
    { id: '3', name: '广州中山医院', code: 'ZSH001', country: '中国', province: '广东', region: '越秀区', contractNo: 'CON2024003' }
  ];

  const mockProducts = [
    { id: '1', name: '全基因组测序', code: 'WGS001', type: '测序类' },
    { id: '2', name: '外显子组测序', code: 'WES001', type: '测序类' },
    { id: '3', name: '肿瘤基因检测', code: 'TUMOR001', type: '肿瘤类' },
    { id: '4', name: '遗传病基因检测', code: 'GENE001', type: '遗传类' }
  ];

  const sampleTypes = ['全血', '血浆', '组织液', '尿液', '切片'];
  const deliveryRequirements = ['线上报告', '纸质报告邮寄', '原始数据'];
  const idTypes = ['身份证号', '护照号', '其他'];
  const ageTypes = ['正常', '不满周岁'];
  const genders = ['男', '女', '未知'];
  const informedConsentOptions = ['已同意', '未同意'];

  const handleCustomerSelect = (customerIds: string[]) => {
    if (customerIds.length === 1) {
      const customer = mockCustomers.find(c => c.id === customerIds[0]);
      setSelectedCustomer(customer);
      form.setFieldValue('customerId', customer?.name);
    }
    setCustomerModalVisible(false);
  };

  const handleProductSelect = (productIds: string[]) => {
    const products = mockProducts.filter(p => productIds.includes(p.id));
    setSelectedProducts(products);
    form.setFieldValue('products', products.map(p => p.name).join(', '));
    setProductModalVisible(false);
  };

  const validateSamplingTime = (_: any, value: any) => {
    if (!value) return Promise.reject(new Error('请选择采样时间'));
    const samplingTime = value;
    const now = new Date();
    if (samplingTime.toDate() > now) {
      return Promise.reject(new Error('采样时间不能晚于当前时间'));
    }
    return Promise.resolve();
  };

  const validateBirthDate = (_: any, value: any) => {
    if (!value) return Promise.resolve();
    const birthDate = value;
    const now = new Date();
    if (birthDate.toDate() > now) {
      return Promise.reject(new Error('出生日期不能晚于当前日期'));
    }
    return Promise.resolve();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const orderData = {
        type: 'product' as const,
        status: 'processing' as const,
        priority: 'normal' as const,
        customerId: selectedCustomer?.id || '',
        customer: selectedCustomer,
        patientId: Date.now().toString(),
        patient: {
          id: Date.now().toString(),
          name: values.patientName,
          phone: values.patientPhone || '',
          idType: values.patientIdType,
          idNumber: values.patientId,
          nativePlace: values.nativePlace || '',
          birthDate: values.birthDate ? values.birthDate.toISOString() : undefined,
          ageType: values.ageType,
          age: values.age,
          monthAge: values.monthAge,
          gender: values.gender
        },
        sampleNos: [values.sampleNo],
        originalSampleNos: values.originalSampleNo ? [values.originalSampleNo] : [],
        sampleTypes: [values.sampleType],
        samplingTime: values.samplingTime.toISOString(),
        deliveryRequirements: values.deliveryRequirements,
        items: selectedProducts.map(product => ({
          id: Date.now().toString() + Math.random(),
          orderId: '',
          productId: product.id,
          product,
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000
        })),
        totalAmount: selectedProducts.length * 1000,
        createdBy: 'admin',
        contractNo: values.contractNo || '',
        researchProject: values.researchProject || '',
        customerPhone: values.customerPhone || '',
        customerEmail: values.customerEmail || '',
        customerContact: values.customerContact || '',
        clinicalDiagnosis: values.clinicalDiagnosis || '',
        knownDiseases: values.knownDiseases || '',
        familyHistory: values.familyHistory || '',
        genotype: values.genotype || '',
        phenotype: values.phenotype || '',
        informedConsent: values.informedConsent
      };

      createOrder(orderData);
      message.success('订单提交成功');
      navigate('/order/query');
    } catch (error) {
      console.error('Submit failed:', error);
    }
  };

  const handleCancel = () => {
    navigate('/order/query');
  };

  return (
    <div className="h-full bg-white p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">新建订单</h1>
        <Button icon={<CloseOutlined />} onClick={handleCancel}>
          关闭
        </Button>
      </div>

      <Form form={form} layout="vertical">
        {/* 客户信息 */}
        <Card title="客户信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="客户名称"
                name="customerId"
                rules={[{ required: true, message: '请选择客户' }]}
              >
                <Input
                  placeholder="请选择客户"
                  readOnly
                  onClick={() => setCustomerModalVisible(true)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="合同编号" name="contractNo">
                <Input placeholder="请输入合同编号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="科研项目名称" name="researchProject">
                <Input placeholder="请输入科研项目名称" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="客户联系电话" name="customerPhone">
                <Input placeholder="请输入客户联系电话" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="客户邮箱" name="customerEmail">
                <Input placeholder="请输入客户邮箱" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="客户联系人" name="customerContact">
                <Input placeholder="请输入客户联系人" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 样本信息 */}
        <Card title="样本信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="样本编号"
                name="sampleNo"
                rules={[
                  { required: true, message: '请输入样本编号' },
                  { pattern: /^[a-zA-Z0-9]+$/, message: '支持字母、数字' }
                ]}
              >
                <Input placeholder="请输入样本编号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="原始样本编号" name="originalSampleNo">
                <Input placeholder="请输入原始样本编号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="样本类型"
                name="sampleType"
                rules={[{ required: true, message: '请选择样本类型' }]}
              >
                <Select placeholder="请选择样本类型">
                  {sampleTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="采样时间"
                name="samplingTime"
                rules={[{ validator: validateSamplingTime }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择采样时间"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 产品信息 */}
        <Card title="产品信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item
                label="产品名称"
                name="products"
                rules={[{ required: true, message: '请选择产品' }]}
              >
                <Input
                  placeholder="请选择产品"
                  readOnly
                  onClick={() => setProductModalVisible(true)}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item
                label="交付要求"
                name="deliveryRequirements"
                rules={[{ required: true, message: '请选择交付要求' }]}
              >
                <Select mode="multiple" placeholder="请选择交付要求">
                  {deliveryRequirements.map(req => (
                    <Option key={req} value={req}>{req}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 患者信息 */}
        <Card title="患者信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="患者姓名"
                name="patientName"
                rules={[{ required: true, message: '请输入患者姓名' }]}
              >
                <Input placeholder="请输入患者姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="患者手机号" name="patientPhone">
                <Input placeholder="请输入患者手机号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="患者ID类型"
                name="patientIdType"
                rules={[{ required: true, message: '请选择患者ID类型' }]}
              >
                <Select placeholder="请选择患者ID类型">
                  {idTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="患者ID"
                name="patientId"
                rules={[
                  { required: true, message: '请输入患者ID' },
                  { pattern: /^[a-zA-Z0-9]+$/, message: '支持字母、数字' }
                ]}
              >
                <Input placeholder="请输入患者ID" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="籍贯" name="nativePlace">
                <Input placeholder="请输入籍贯" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="出生日期"
                name="birthDate"
                rules={[{ validator: validateBirthDate }]}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  placeholder="请选择出生日期"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="年龄类型" name="ageType">
                <Select placeholder="请选择年龄类型">
                  {ageTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="年龄" name="age">
                <Input placeholder="请输入年龄" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="月龄" name="monthAge">
                <Input placeholder="请输入月龄" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="性别" name="gender">
                <Select placeholder="请选择性别">
                  {genders.map(gender => (
                    <Option key={gender} value={gender}>{gender}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 病历信息 */}
        <Card title="病历信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="表现型" name="phenotype">
                <Input placeholder="请输入表现型" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="已知疾病" name="knownDiseases">
                <Input placeholder="请输入已知疾病" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="家族病史" name="familyHistory">
                <Input placeholder="请输入家族病史" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="基因型" name="genotype">
                <Input placeholder="请输入基因型" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="临床诊断" name="clinicalDiagnosis">
                <Input placeholder="请输入临床诊断" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item
                label="知情同意书"
                name="informedConsent"
                rules={[{ required: true, message: '请选择知情同意书' }]}
              >
                <Select placeholder="请选择知情同意书">
                  {informedConsentOptions.map(option => (
                    <Option key={option} value={option}>{option}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 提交按钮 */}
        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSubmit}>
            提交
          </Button>
        </div>
      </Form>

      <CustomerSelectModal
        visible={customerModalVisible}
        onCancel={() => setCustomerModalVisible(false)}
        onSelect={handleCustomerSelect}
        selectedCustomers={selectedCustomer ? [selectedCustomer.id] : []}
        multiple={false}
      />

      <ProductSelectModal
        visible={productModalVisible}
        onCancel={() => setProductModalVisible(false)}
        onSelect={handleProductSelect}
        selectedProducts={selectedProducts.map(p => p.id)}
        multiple={true}
      />
    </div>
  );
};

export default ProductNew;