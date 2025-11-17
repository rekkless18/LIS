import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Row, Col, message } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrderStore } from '@/stores/order';
import { CustomerSelectModal } from '@/components/modals/CustomerSelectModal';
import { PackageSelectModal } from '@/components/modals/PackageSelectModal';

const { Option } = Select;
const { TextArea } = Input;

const PackageEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { orders, updateOrder, setCurrentOrder } = useOrderStore();
  const [form] = Form.useForm();
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [packageModalVisible, setPackageModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [order, setOrder] = useState<any>(null);

  const mockCustomers = [
    { id: '1', name: '北京协和医院', code: 'PUMCH001', country: '中国', province: '北京', region: '东城区', contractNo: 'CON2024001' },
    { id: '2', name: '上海瑞金医院', code: 'RJH001', country: '中国', province: '上海', region: '黄浦区', contractNo: 'CON2024002' },
    { id: '3', name: '广州中山医院', code: 'ZSH001', country: '中国', province: '广东', region: '越秀区', contractNo: 'CON2024003' }
  ];

  const mockPackages = [
    {
      id: '1',
      name: '基础健康检测套餐',
      code: 'BASIC001',
      type: '基础类',
      sampleCount: 2,
      sampleTypes: ['全血', '血浆'],
      products: [
        { id: '1', name: '全基因组测序', code: 'WGS001', type: '测序类' },
        { id: '2', name: '外显子组测序', code: 'WES001', type: '测序类' }
      ]
    },
    {
      id: '2',
      name: '肿瘤筛查套餐',
      code: 'TUMOR001',
      type: '肿瘤类',
      sampleCount: 3,
      sampleTypes: ['全血', '血浆', '组织液'],
      products: [
        { id: '3', name: '肿瘤基因检测', code: 'TUMOR001', type: '肿瘤类' },
        { id: '4', name: '遗传病基因检测', code: 'GENE001', type: '遗传类' }
      ]
    }
  ];

  const idTypes = ['身份证号', '护照号', '其他'];
  const ageTypes = ['正常', '不满周岁'];
  const genders = ['男', '女', '未知'];
  const informedConsentOptions = ['已同意', '未同意'];

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find(o => o.id === id && o.type === 'package');
      if (foundOrder) {
        setOrder(foundOrder);
        setCurrentOrder(foundOrder);
        setSelectedCustomer(foundOrder.customer);
        setSelectedPackage(foundOrder.package);
        
        // Initialize form with order data
        form.setFieldsValue({
          customerId: foundOrder.customer?.name,
          contractNo: foundOrder.contractNo || '',
          researchProject: foundOrder.researchProject || '',
          customerPhone: foundOrder.customerPhone || '',
          customerEmail: foundOrder.customerEmail || '',
          customerContact: foundOrder.customerContact || '',
          packageId: foundOrder.package?.name,
          patientName: foundOrder.patient?.name || '',
          patientPhone: foundOrder.patient?.phone || '',
          patientIdType: foundOrder.patient?.idType || '',
          patientId: foundOrder.patient?.idNumber || '',
          nativePlace: foundOrder.patient?.nativePlace || '',
          birthDate: null,
          ageType: foundOrder.patient?.ageType || '',
          age: foundOrder.patient?.age || '',
          monthAge: foundOrder.patient?.monthAge || '',
          gender: foundOrder.patient?.gender || '',
          samplingTime: null,
          deliveryRequirements: foundOrder.deliveryRequirements || [],
          clinicalDiagnosis: foundOrder.clinicalDiagnosis || '',
          knownDiseases: foundOrder.knownDiseases || '',
          familyHistory: foundOrder.familyHistory || '',
          genotype: foundOrder.genotype || '',
          phenotype: foundOrder.phenotype || '',
          informedConsent: foundOrder.informedConsent || ''
        });

        // Set sample numbers
        foundOrder.sampleNos.forEach((sampleNo: string, index: number) => {
          form.setFieldValue(`sampleNo${index}`, sampleNo);
        });
        foundOrder.originalSampleNos?.forEach((sampleNo: string, index: number) => {
          form.setFieldValue(`originalSampleNo${index}`, sampleNo);
        });
      } else {
        message.error('订单不存在');
        navigate('/order/query');
      }
    }
  }, [id, orders, navigate, form, setCurrentOrder]);

  const handleCustomerSelect = (customerIds: string[]) => {
    if (customerIds.length === 1) {
      const customer = mockCustomers.find(c => c.id === customerIds[0]);
      setSelectedCustomer(customer);
      form.setFieldValue('customerId', customer?.name);
    }
    setCustomerModalVisible(false);
  };

  const handlePackageSelect = (packageId: string) => {
    const pkg = mockPackages.find(p => p.id === packageId);
    setSelectedPackage(pkg);
    form.setFieldValue('packageId', pkg?.name);
    setPackageModalVisible(false);
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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (!order) {
        message.error('订单数据不存在');
        return;
      }

      if (!selectedPackage) {
        message.error('请选择套餐');
        return;
      }

      const updateData = {
        customerId: selectedCustomer?.id || order.customerId,
        customer: selectedCustomer || order.customer,
        packageId: selectedPackage.id,
        package: selectedPackage,
        patient: {
          ...order.patient,
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
        sampleNos: Array(selectedPackage.sampleCount).fill(0).map((_, index) => values[`sampleNo${index}`] || `SAMPLE${index + 1}`),
        originalSampleNos: Array(selectedPackage.sampleCount).fill(0).map((_, index) => values[`originalSampleNo${index}`] || ''),
        sampleTypes: selectedPackage.sampleTypes,
        samplingTime: values.samplingTime.toISOString(),
        deliveryRequirements: values.deliveryRequirements || [],
        items: selectedPackage.products.map(product => ({
          id: Date.now().toString() + Math.random(),
          orderId: order.id,
          productId: product.id,
          product,
          quantity: 1,
          unitPrice: 1000,
          totalPrice: 1000
        })),
        totalAmount: selectedPackage.products.length * 1000,
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

      updateOrder(order.id, updateData);
      message.success('订单保存成功');
      navigate('/order/query');
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleCancel = () => {
    navigate('/order/query');
  };

  if (!order) {
    return <div>加载中...</div>;
  }

  return (
    <div className="h-full bg-white p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">编辑订单</h1>
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

        {/* 套餐信息 */}
        <Card title="套餐信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item
                label="套餐名称"
                name="packageId"
                rules={[{ required: true, message: '请选择套餐' }]}
              >
                <Input
                  placeholder="请选择套餐"
                  readOnly
                  onClick={() => setPackageModalVisible(true)}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 样本信息 */}
        <Card title="样本信息" className="mb-6">
          {selectedPackage && Array(selectedPackage.sampleCount).fill(0).map((_, index) => (
            <Row gutter={16} key={index} className="mb-4">
              <Col xs={24} sm={12} md={6}>
                <Form.Item
                  label={`样本编号 ${index + 1}`}
                  name={`sampleNo${index}`}
                  rules={[
                    { required: true, message: '请输入样本编号' },
                    { pattern: /^[a-zA-Z0-9]+$/, message: '支持字母、数字' }
                  ]}
                >
                  <Input placeholder={`请输入样本编号 ${index + 1}`} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label={`原始样本编号 ${index + 1}`} name={`originalSampleNo${index}`}>
                  <Input placeholder={`请输入原始样本编号 ${index + 1}`} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="样本类型">
                  <Input value={selectedPackage.sampleTypes[index]} disabled />
                </Form.Item>
              </Col>
              {index === 0 && (
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
              )}
            </Row>
          ))}
        </Card>

        {/* 产品信息 */}
        <Card title="产品信息" className="mb-6">
          {selectedPackage && (
            <Row gutter={16}>
              {selectedPackage.products.map((product, index) => (
                <Col xs={24} sm={12} md={6} key={index}>
                  <Form.Item label={`产品 ${index + 1}`}>
                    <Input value={product.name} disabled />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          )}
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

        {/* 保存按钮 */}
        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave}>
            保存
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

      <PackageSelectModal
        visible={packageModalVisible}
        onCancel={() => setPackageModalVisible(false)}
        onSelect={handlePackageSelect}
      />
    </div>
  );
};

export default PackageEdit;
