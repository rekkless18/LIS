import React from 'react';
import { Card, Row, Col, Statistic, Tag, Button } from 'antd';
import { 
  FileSearchOutlined, 
  ExperimentOutlined, 
  TruckOutlined, 
  FileTextOutlined,
  EnvironmentOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

/**
 * 首页组件
 * 包含快捷入口区、待审批事项区、实验室状态区和设备告警区
 */
const Home: React.FC = () => {
  const navigate = useNavigate();

  /**
   * 快捷入口配置
   * 包含图标、标题和跳转路径
   */
  const quickEntries = [
    {
      title: '订单查询',
      icon: <FileSearchOutlined className="text-3xl text-blue-500" />,
      path: '/order/orderquery',
      description: '查看订单信息'
    },
    {
      title: '样本查询',
      icon: <ExperimentOutlined className="text-3xl text-green-500" />,
      path: '/samples/samplesquery',
      description: '查看样本信息'
    },
    {
      title: '物流查询',
      icon: <TruckOutlined className="text-3xl text-orange-500" />,
      path: '/logistics/logisticsquery',
      description: '查看物流信息'
    },
    {
      title: '交付下载',
      icon: <FileTextOutlined className="text-3xl text-purple-500" />,
      path: '/order/delivery',
      description: '下载报告与预览'
    }
  ];

  /**
   * 设备状态配置
   * 包含设备名称、状态和图标
   */
  const equipmentStatus = [
    { name: '冰箱', status: 'normal', icon: <CheckCircleOutlined className="text-green-500" /> },
    { name: 'AGV', status: 'fault', icon: <CloseCircleOutlined className="text-red-500" /> },
    { name: '测序仪', status: 'normal', icon: <CheckCircleOutlined className="text-green-500" /> },
    { name: '生化检测仪', status: 'normal', icon: <CheckCircleOutlined className="text-green-500" /> },
    { name: '血液检测仪', status: 'offline', icon: <PauseCircleOutlined className="text-gray-500" /> }
  ];

  /**
   * 获取状态标签颜色
   * @param status - 状态值
   * @returns 标签颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'success';
      case 'fault': return 'error';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  /**
   * 获取状态文本
   * @param status - 状态值
   * @returns 状态文本
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return '运行正常';
      case 'fault': return '故障';
      case 'offline': return '离线';
      default: return '未知';
    }
  };

  /**
   * 处理快捷入口点击事件
   * @param path - 跳转路径
   */
  const handleQuickEntryClick = (path: string) => {
    navigate(path);
  };

  /**
   * 处理待审批事项点击事件
   */
  const handleApprovalClick = () => {
    navigate('/approval/approvalquery');
  };

  /**
   * 处理实验室状态点击事件
   */
  const handleLabStatusClick = () => {
    navigate('/labmanage/environmentmanage');
  };

  /**
   * 处理设备告警点击事件
   */
  const handleEquipmentClick = () => {
    navigate('/labmanage/equipmentmanage');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 快捷入口区 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">快捷入口</h2>
        <Row gutter={[16, 16]}>
          {quickEntries.map((entry, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card
                hoverable
                className="h-32 cursor-pointer transition-all duration-300 hover:shadow-lg"
                onClick={() => handleQuickEntryClick(entry.path)}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="mb-2">{entry.icon}</div>
                  <div className="text-lg font-medium text-gray-800">{entry.title}</div>
                  <div className="text-sm text-gray-500">{entry.description}</div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 待审批事项区和实验室状态区 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* 待审批事项区 */}
        <Col xs={24} lg={12}>
          <Card
            title="待审批事项"
            hoverable
            className="cursor-pointer h-64"
            onClick={handleApprovalClick}
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <Statistic
                  title="待审批事项数量"
                  value={3}
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<FileSearchOutlined />}
                />
                <div className="mt-4">
                  <Tag color="orange">即将超时: 1</Tag>
                </div>
              </div>
              <div className="text-right">
                <Button type="link" size="small">
                  查看详情
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        {/* 实验室状态区 */}
        <Col xs={24} lg={12}>
          <Card
            title="实验室状态"
            hoverable
            className="cursor-pointer h-64"
            onClick={handleLabStatusClick}
          >
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="mb-4">
                  <Tag color="success" icon={<CheckCircleOutlined />}>
                    运行正常
                  </Tag>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">26.3°</div>
                    <div className="text-sm text-gray-500">温度</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">51.6%</div>
                    <div className="text-sm text-gray-500">湿度</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Button type="link" size="small" onClick={handleLabStatusClick}>
                  环境管理
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 设备告警区 */}
      <div>
        <Card
          title="设备告警"
          hoverable
          className="cursor-pointer"
          onClick={handleEquipmentClick}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {equipmentStatus.map((equipment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="mr-2">{equipment.icon}</div>
                  <div>
                    <div className="font-medium text-gray-800">{equipment.name}</div>
                    <Tag color={getStatusColor(equipment.status)}>
                      {getStatusText(equipment.status)}
                    </Tag>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Button type="link" size="small" onClick={handleEquipmentClick}>
              设备管理
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
