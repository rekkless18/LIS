import React, { useState } from 'react';
import { Card, Form, Input, Button, Row, Col, message } from 'antd';
import { CloseOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSampleStore } from '@/stores/samples';

const Receive: React.FC = () => {
  const navigate = useNavigate();
  const { receive } = useSampleStore();
  const [form] = Form.useForm();
  const [samples, setSamples] = useState<string[]>(['']);

  const addRow = () => setSamples(prev => [...prev, '']);
  const removeRow = (idx: number) => setSamples(prev => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const handleSave = async () => {
    const v = await form.validateFields();
    const nos = samples.map((_, idx) => v[`sampleNo_${idx}`]).filter(Boolean);
    if (nos.length === 0) { message.error('请填写样本编号'); return; }
    receive({ waybillNo: v.waybillNo, storageLocation: v.storageLocation, storageBoxId: v.storageBoxId, sampleNos: nos });
    message.success('样本接收成功');
    navigate('/samples/query');
  };

  const handleClose = () => navigate('/samples/query');

  return (
    <div className="h-full bg-white p-6 overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">样本接收</h1>
        <Button icon={<CloseOutlined />} onClick={handleClose}>关闭</Button>
      </div>

      <Form form={form} layout="vertical">
        <Card title="物流信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="物流单号" name="waybillNo" rules={[{ required: true }]}>
                <Input placeholder="请输入物流单号" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="存储信息" className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="存储位置" name="storageLocation" rules={[{ required: true }]}>
                <Input placeholder="请输入存储位置" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Form.Item label="存储盒ID" name="storageBoxId" rules={[{ required: true }]}>
                <Input placeholder="请输入存储盒ID" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card title="样本确认信息" className="mb-6">
          {samples.map((value, idx) => (
            <Row gutter={16} align="bottom" key={idx} className="mb-2">
              <Col xs={18} sm={12} md={6}>
                <Form.Item label="样本编号" name={`sampleNo_${idx}`} rules={[{ required: true }]}> 
                  <Input placeholder="请输入样本编号" />
                </Form.Item>
              </Col>
              <Col xs={6} sm={12} md={6}>
                <div className="flex items-center space-x-2">
                  <Button icon={<PlusOutlined />} onClick={addRow}>新增</Button>
                  <Button icon={<MinusOutlined />} onClick={() => removeRow(idx)}>删除</Button>
                </div>
              </Col>
            </Row>
          ))}
        </Card>

        <div className="flex justify-end">
          <Button type="primary" size="large" onClick={handleSave}>保存</Button>
        </div>
      </Form>
    </div>
  );
};

export default Receive;
