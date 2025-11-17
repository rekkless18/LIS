import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Row, Col } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrderStore } from '@/stores/order';

const { Option } = Select;
const { TextArea } = Input;

const PackageDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { orders, setCurrentOrder } = useOrderStore();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const foundOrder = orders.find(o => o.id === id && o.type === 'package');
      if (foundOrder) {
        setOrder(foundOrder);
        setCurrentOrder(foundOrder);
      } else {
        navigate('/order/query');
      }
    }
  }, [id, orders, navigate, setCurrentOrder]);

  const handleClose = () => {
    navigate('/order/query');
  };

  if (!order) {
    return <div>加载中...</div>;
  }

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const formatDateTime = (dateString: string) => {
    const d = new Date(dateString);
    const Y = d.getFullYear();
    const M = pad(d.getMonth() + 1);
    const D = pad(d.getDate());
    const h = pad(d.getHours());
    const m = pad(d.getMinutes());
    const s = pad(d.getSeconds());
    return `${Y}-${M}-${D} ${h}:${m}:${s}`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const Y = d.getFullYear();
    const M = pad(d.getMonth() + 1);
    const D = pad(d.getDate());
    return `${Y}-${M}-${D}`;
  };

  return (
    <div className="h-full bg-white p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">查看订单</h1>
        <Button icon={<CloseOutlined />} onClick={handleClose}>
          关闭
        </Button>
      </div>

      <Form layout="vertical">
        {/* 客户信息 */}
        <Card title="客户信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="客户名称">
                <Input value={order.customer?.name} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="合同编号">
                <Input value={order.contractNo || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="科研项目名称">
                <Input value={order.researchProject || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="客户联系电话">
                <Input value={order.customerPhone || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="客户邮箱">
                <Input value={order.customerEmail || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="客户联系人">
                <Input value={order.customerContact || ''} disabled />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 套餐信息 */}
        <Card title="套餐信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item label="套餐名称">
                <Input value={order.package?.name || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="套餐编码">
                <Input value={order.package?.code || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="套餐类型">
                <Input value={order.package?.type || ''} disabled />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 样本信息 */}
        <Card title="样本信息" className="mb-6">
          {order.sampleNos.map((sampleNo: string, index: number) => (
            <Row gutter={16} key={index} className="mb-4">
              <Col xs={24} sm={12} md={6}>
                <Form.Item label={`样本编号 ${index + 1}`}>
                  <Input value={sampleNo} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label={`原始样本编号 ${index + 1}`}>
                  <Input value={order.originalSampleNos?.[index] || ''} disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="样本类型">
                  <Input value={order.sampleTypes[index] || ''} disabled />
                </Form.Item>
              </Col>
              {index === 0 && (
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="采样时间">
                    <Input value={formatDateTime(order.samplingTime)} disabled />
                  </Form.Item>
                </Col>
              )}
            </Row>
          ))}
        </Card>

        {/* 产品信息 */}
        <Card title="产品信息" className="mb-6">
          <Row gutter={16}>
            {order.items.map((item: any, index: number) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Form.Item label={`产品 ${index + 1}`}>
                  <Input value={item.product.name} disabled />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Card>

        {/* 患者信息 */}
        <Card title="患者信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="患者姓名">
                <Input value={order.patient?.name || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="患者手机号">
                <Input value={order.patient?.phone || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="患者ID类型">
                <Input value={order.patient?.idType || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="患者ID">
                <Input value={order.patient?.idNumber || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="籍贯">
                <Input value={order.patient?.nativePlace || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="出生日期">
                <Input value={order.patient?.birthDate ? formatDate(order.patient.birthDate) : ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="年龄类型">
                <Input value={order.patient?.ageType || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="年龄">
                <Input value={order.patient?.age || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="月龄">
                <Input value={order.patient?.monthAge || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="性别">
                <Input value={order.patient?.gender || ''} disabled />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* 病历信息 */}
        <Card title="病历信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="表现型">
                <Input value={order.phenotype || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="已知疾病">
                <Input value={order.knownDiseases || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="家族病史">
                <Input value={order.familyHistory || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="基因型">
                <Input value={order.genotype || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="临床诊断">
                <Input value={order.clinicalDiagnosis || ''} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="知情同意书">
                <Input value={order.informedConsent === 'agreed' ? '已同意' : '未同意'} disabled />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default PackageDetail;
