import React, { useState, useEffect } from 'react';
import { Menu, Input, Space, Button } from 'antd';
import {
  HomeOutlined,
  TruckOutlined,
  ContainerOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  BankOutlined,
  DatabaseOutlined,
  CheckSquareOutlined,
  CheckOutlined,
  SettingOutlined,
  SafetyOutlined,
  SearchOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  StarOutlined,
  FileAddOutlined,
  AuditOutlined,
  FileSearchOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  InboxOutlined,
  UserOutlined,
  FormOutlined,
  LayoutOutlined,
  TeamOutlined,
  GlobalOutlined,
  WarningOutlined,
  FilterOutlined,
  LineChartOutlined,
  BarChartOutlined,
  StopOutlined,
  AppstoreOutlined,
  ProfileOutlined,
  EnvironmentOutlined,
  BranchesOutlined,
  DesktopOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

  const { Search } = Input;

interface SidebarProps {
  collapsed: boolean;
}

/**
 * 侧导航组件
 * 包含品牌logo、系统名称、搜索框和多级导航菜单
 */
export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  /**
   * 处理菜单项点击事件
   * @param key - 菜单项的key值
   */
  /**
   * 函数功能：处理菜单项点击事件并进行路由跳转
   * 参数说明：key(string) - 被点击菜单项的唯一标识，用于路由路径
   * 返回值：void - 无返回值，执行导航操作
   * 用途描述：当用户点击任意菜单项时，触发路由跳转至对应页面
   */
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  /**
   * 函数功能：处理搜索输入并根据关键词过滤菜单，同时展开匹配的父级菜单
   * 参数说明：value(string) - 用户输入的搜索关键词
   * 返回值：void - 无返回值，更新搜索状态与展开项
   * 用途描述：实现侧导航的实时搜索过滤功能，提高菜单项定位效率
   */
  const handleSearch = (value: string) => {
    const q = value.trim();
    setSearchValue(q);
    if (q) {
      const filtered = filterMenuItems(menuItems, q);
      setOpenKeys(collectOpenKeys(filtered));
    } else {
      setOpenKeys([]);
    }
  };

  /**
   * 函数功能：递归过滤菜单项树，保留与关键词匹配的节点及其父级
   * 参数说明：
   * - items(Array) - 原始菜单项树
   * - query(string) - 搜索关键词
   * 返回值：Array - 过滤后的菜单项树结构
   * 用途描述：用于根据搜索关键词生成用于渲染的菜单项集合
   */
  const filterMenuItems = (items: any[], query: string): any[] => {
    const q = query.toLowerCase();
    return items
      .map((item) => {
        const labelText = typeof item.label === 'string' ? item.label : '';
        const matchSelf = labelText.toLowerCase().includes(q);
        if (item.children) {
          const children = filterMenuItems(item.children, query);
          if (matchSelf || children.length > 0) {
            return { ...item, children };
          }
        }
        return matchSelf ? { ...item } : null;
      })
      .filter(Boolean) as any[];
  };

  /**
   * 函数功能：收集需展开的父级菜单 key，用于搜索时自动展开
   * 参数说明：items(Array) - 过滤后或原始菜单项树
   * 返回值：string[] - 需要展开的菜单 key 列表
   * 用途描述：保证搜索结果展示完整，父级菜单默认展开
   */
  const collectOpenKeys = (items: any[]): string[] => {
    const keys: string[] = [];
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        keys.push(item.key);
      }
    });
    return keys;
  };

  /**
   * 函数功能：生成导航菜单数据，按搜索结果进行过滤（若有关键词）
   * 参数说明：无
   * 返回值：Array - antd Menu 的 items 数据结构
   * 用途描述：侧栏菜单的数据源，支持搜索过滤
   */
  const menuItems = [
    {
      key: '/home',
      icon: <HomeOutlined />,
      label: '首页'
    },
    {
      key: 'order',
      icon: <AppstoreOutlined />,
      label: '订单管理',
        children: [
          {
          key: '/order/orderquery',
          icon: <SearchOutlined />,
          label: '订单查询'
          },
        {
          key: '/order/sample',
          icon: <SearchOutlined />,
          label: '样本进度查询'
        },
        {
          key: '/order/delivery',
          icon: <DownloadOutlined />,
          label: '交付下载'
        }
      ]
    },
    {
      key: 'logistics',
      icon: <TruckOutlined />,
      label: '物流管理',
        children: [
          {
          key: '/logistics/logisticsquery',
          icon: <SearchOutlined />,
          label: '物流查询'
          }
        ]
      },
    {
      key: 'sample',
      icon: <ContainerOutlined />,
      label: '样本管理',
        children: [
          {
          key: '/samples/samplesquery',
          icon: <SearchOutlined />,
          label: '样本查询'
          }
        ]
      },
    {
      key: 'test',
      icon: <ExperimentOutlined />,
      label: '实验管理',
      children: [
        {
          key: 'routine',
          icon: <CheckCircleOutlined />,
          label: '普检',
          children: [
            {
              key: '/test/routine/routineexperiment',
              icon: <ExperimentOutlined />,
              label: '普检实验'
            },
            {
              key: '/test/routine/routineexception',
              icon: <WarningOutlined />,
              label: '普检异常处理'
            }
          ]
        },
        {
          key: 'special',
          icon: <StarOutlined />,
          label: '特检',
          children: [
            {
              key: '/test/special/tech-route',
              icon: <CheckCircleOutlined />,
              label: '技术路线确认'
            },
            {
              key: '/test/special/preprocess',
              icon: <FilterOutlined />,
              label: '预处理'
            },
            {
              key: '/test/special/pre-run',
              icon: <ToolOutlined />,
              label: '上机前处理'
            },
            {
              key: '/test/special/sequencing',
              icon: <DesktopOutlined />,
              label: '测序上机'
            },
            {
              key: '/test/special/bioinfo',
              icon: <LineChartOutlined />,
              label: '生信分析'
            },
            {
              key: '/test/special/qpcr',
              icon: <BarChartOutlined />,
              label: 'QPCR分析'
            },
            {
              key: '/test/special/specialaudit',
              icon: <SafetyCertificateOutlined />,
              label: '特检数据审核'
            },
            {
              key: '/test/special/specialexception',
              icon: <StopOutlined />,
              label: '特检异常处理'
            }
          ]
        },
        {
          key: 'mass',
          icon: <ExperimentOutlined />,
          label: '质谱',
          children: [
            {
              key: '/test/ms/msexperiment',
              icon: <ExperimentOutlined />,
              label: '质谱实验'
            },
            {
              key: '/test/ms/msaudit',
              icon: <SafetyCertificateOutlined />,
              label: '质谱数据审核'
            },
            {
              key: '/test/ms/msexception',
              icon: <WarningOutlined />,
              label: '质谱异常处理'
            }
          ]
        }
      ]
    },
    {
      key: 'report',
      icon: <FileTextOutlined />,
      label: '报告管理',
      children: [
        {
          key: '/report/generate',
          icon: <FileAddOutlined />,
          label: '报告生成'
        },
        {
          key: '/report/audit',
          icon: <AuditOutlined />,
          label: '报告审核'
        },
        {
          key: '/report/query',
          icon: <FileSearchOutlined />,
          label: '报告查询'
        },
        {
          key: '/report/exception',
          icon: <ExclamationCircleOutlined />,
          label: '报告异常处理'
        }
      ]
    },
    {
      key: 'lab',
      icon: <BankOutlined />,
      label: '实验室管理',
      children: [
        {
          key: '/labmanage/environmentmanage',
          icon: <EnvironmentOutlined />,
          label: '环境管理'
        },
        {
          key: '/labmanage/equipmentmanage',
          icon: <ToolOutlined />,
          label: '设备管理'
        }
      ]
    },
    {
      key: 'inventory',
      icon: <DatabaseOutlined />,
      label: '库存管理',
      children: [
        {
          key: '/inventory/inventoryquery',
          icon: <InboxOutlined />,
          label: '库存查询'
        }
      ]
    },
    {
      key: 'approval',
      icon: <CheckSquareOutlined />,
      label: '审批管理',
      children: [
        {
          key: '/approval/approvalquery',
          icon: <AuditOutlined />,
          label: '审批查询'
        }
      ]
    },
    {
      key: 'config',
      icon: <SettingOutlined />,
      label: '后台管理',
      children: [
        {
          key: '/config/configpackage',
          icon: <AppstoreOutlined />,
          label: '套餐配置'
        },
        {
          key: '/config/configproduct',
          icon: <AppstoreOutlined />,
          label: '产品配置'
        },
        {
          key: '/config/configtest-item',
          icon: <CheckOutlined />,
          label: '检测项配置'
        },
        {
          key: '/config/configcustomer',
          icon: <UserOutlined />,
          label: '客户配置'
        },
        {
          key: '/config/configreport',
          icon: <FormOutlined />,
          label: '报告配置'
        },
        {
          key: '/config/configtech-route',
          icon: <BranchesOutlined />,
          label: '特检技术路线配置'
        },
        {
          key: '/config/configexperiment',
          icon: <LayoutOutlined />,
          label: '实验配置'
        },
        {
          key: '/config/configapproval',
          icon: <ProfileOutlined />,
          label: '审批配置'
        }
      ]
    },
    {
      key: 'permission',
      icon: <SafetyOutlined />,
      label: '权限管理',
      children: [
        {
          key: '/permission/user',
          icon: <UserOutlined />,
          label: '用户配置'
        },
        {
          key: '/permission/role',
          icon: <TeamOutlined />,
          label: '角色配置'
        }
      ]
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: '系统管理',
      children: [
        {
          key: '/system/global',
          icon: <GlobalOutlined />,
          label: '全局配置'
        }
      ]
    }
  ];

  // 根据搜索值决定渲染的菜单项集合
  const renderedMenuItems = searchValue ? filterMenuItems(menuItems, searchValue) : menuItems;

  return (
    <div 
      className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full ${
        collapsed ? 'w-16' : 'w-52'
      }`}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100
      }}
    >
      {/* 品牌logo和系统名称区域 */}
      <div className="flex items-center h-16 px-3 border-b border-gray-200 flex-shrink-0">
        {/* 品牌logo */}
        <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
          <span className="text-white font-bold text-lg">L</span>
        </div>
        
        {/* 系统名称 */}
        {!collapsed && (
          <div className="ml-3 text-lg font-semibold text-gray-800">
            智惠实验室系统
          </div>
        )}
      </div>

      {/* 搜索框区域 */}
      <div className="p-3 border-b border-gray-200 flex-shrink-0">
        {collapsed ? (
          <div className="flex justify-center">
            <SearchOutlined className="text-gray-500 text-lg" />
          </div>
        ) : (
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="搜索菜单"
              allowClear
              size="small"
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Button size="small" icon={<SearchOutlined />} />
          </Space.Compact>
        )}
      </div>

      {/* 导航菜单区域 */}
      <div className="flex-1 overflow-y-auto">
        <Menu
          mode="inline"
          theme="light"
          items={renderedMenuItems}
          selectedKeys={[location.pathname]}
          openKeys={openKeys}
          onOpenChange={setOpenKeys as any}
          inlineCollapsed={collapsed}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent'
          }}
        />
      </div>
    </div>
  );
};
