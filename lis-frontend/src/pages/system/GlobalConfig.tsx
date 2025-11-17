import React, { useEffect } from 'react';
import { Card, Row, Col, Form, Input, Space, Button, message } from 'antd';
import { useSystemStore } from '@/stores/system';

const GlobalConfig: React.FC = () => {
  const [form] = Form.useForm();
  const { params, setParams } = useSystemStore();

  useEffect(() => {
    form.setFieldsValue({
      loginSystemName: params.loginSystemName,
      menuSystemName: params.menuSystemName,
      version: params.version
    });
  }, [params, form]);

  const handleSave = () => {
    form.validateFields().then((values) => {
      setParams(values);
      message.success('系统参数已保存');
    });
  };

  const handleReset = () => {
    form.setFieldsValue({ loginSystemName: '智惠实验室系统', menuSystemName: '智惠实验室系统', version: 'v0.0.1' });
  };

  return (
    <div className="p-4">
      <div style={{ height: 64, padding: 16 }} className="flex items-center justify-between bg-white rounded border mb-3">
        <Space>
          <Button type="primary" onClick={handleSave}>保存</Button>
        </Space>
        <Space>
          <Button onClick={handleReset}>重置</Button>
        </Space>
      </div>

      <Card title="页面设置区" size="small" styles={{ body: { padding: 16 } }}>
        <Form layout="vertical" form={form}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="登录页系统名称" name="loginSystemName" rules={[{ required: true, message: '请输入登录页系统名称' }]}>
                <Input placeholder="请输入登录页系统名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="菜单系统名称" name="menuSystemName" rules={[{ required: true, message: '请输入菜单系统名称' }]}>
                <Input placeholder="请输入菜单系统名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="版本号" name="version" rules={[{ required: true, message: '请输入版本号' }]}>
                <Input placeholder="请输入版本号" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default GlobalConfig;

