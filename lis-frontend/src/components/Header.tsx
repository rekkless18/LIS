import React, { useState } from 'react';
import { Breadcrumb, Avatar, Dropdown, message } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { RoleActionBar } from './permission/RoleActionBar';

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

/**
 * 顶标题栏组件
 * 包含侧导航折叠展开按钮、面包屑导航、用户头像和下拉菜单
 */
export const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [pwdVisible, setPwdVisible] = useState(false);
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  /**
   * 处理用户下拉菜单点击事件
   * @param key - 菜单项的key值
   */
  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 退出登录
      logout();
      navigate('/login');
    } else if (key === 'password') {
      setPwdVisible(true);
    }
    setDropdownVisible(false);
  };

  /**
   * 函数功能：生成面包屑导航项，基于当前路径拆分并映射中文标题
   * 参数说明：无
   * 返回值：Array - antd Breadcrumb 的 items 数组
   * 用途描述：在顶栏展示用户当前所在路径的导航层级
   */
  const generateBreadcrumbItems = () => {
    const path = location.pathname.replace(/^\/+|\/+$/g, '');
    const segments = path ? path.split('/') : [];
    const mapTitle = (seg: string) => {
      switch (seg) {
        case 'home': return '首页';
        case 'order': return '订单管理';
        case 'orderquery': return '订单查询';
        case 'new': return '新建订单';
        case 'package': return '套餐订单';
        case 'product': return '产品订单';
        case 'sample': return '样本进度查询';
        case 'delivery': return '交付下载';      
        case 'logistics': return '物流管理';
        case 'logisticsquery': return '物流查询';
        case 'samples': return '样本管理';
        case 'samplesquery': return '样本查询';
        case 'receive': return '样本接收';
        case 'test': return '实验管理';
        case 'routine': return '普检';
        case 'routineexperiment': return '普检实验';
        case 'routineexception': return '普检异常处理';
        case 'special': return '特检';
        case 'tech-route': return '技术路线确认';
        case 'preprocess': return '预处理';
        case 'pre-run': return '上机前处理';
        case 'sequencing': return '测序上机';
        case 'bioinfo': return '生信分析';
        case 'qpcr': return 'QPCR分析';
        case 'specialaudit': return '特检数据审核';
        case 'specialexception': return '特检异常处理';
        case 'ms': return '质谱';
        case 'msexperiment': return '质谱实验';
        case 'msaudit': return '质谱数据审核';
        case 'msexception': return '质谱异常处理';
        case 'report': return '报告管理';
        case 'generate': return '报告生成';
        case 'audit': return '报告审核';
        case 'query': return '报告查询';
        case 'exception': return '报告异常处理';
        case 'labmanage': return '实验室管理';
        case 'environmentmanage': return '环境管理';
        case 'equipmentmanage': return '设备管理';
        case 'inventory': return '库存管理';
        case 'inventoryquery': return '库存查询';
        case 'approval': return '审批管理';
        case 'approvalquery': return '审批查询';       
        case 'config': return '后台管理';
        case 'configpackage': return '套餐配置';
        case 'configproduct': return '产品配置';
        case 'configtest-item': return '检测项配置';
        case 'configcustomer': return '客户配置';
        case 'configreport': return '报告配置';
        case 'configtech-route': return '特检技术路线配置';
        case 'configexperiment': return '实验配置';
        case 'configapproval': return '审批配置';
        case 'permission': return '权限管理';
        case 'user': return '用户配置';
        case 'role': return '角色配置';
        case 'system': return '系统管理';
        case 'global': return '全局配置';       
        default: return seg;
      }
    };
    const items = segments.map((seg) => ({ title: mapTitle(seg) }));
    return items.length > 0 ? items.slice(0, 3) : [{ title: '首页' }];
  };

  const submitChangePassword = async () => {
    const errors: string[] = [];
    if (!oldPwd) errors.push('当前密码错误');
    if (newPwd.length < 6 || newPwd.length > 20) errors.push('新密码格式错误');
    if (newPwd !== confirmPwd) errors.push('两次输入密码不一致');
    if (errors.length) {
      message.error(errors[0]);
      return;
    }
    try {
      setPwdLoading(true);
      const base = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';
      const resp = await fetch(`${base}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: user?.username, old_password: oldPwd, new_password: newPwd })
      });
      const data = await resp.json();
      if (!resp.ok || !data?.success) {
        message.error(data?.error || '修改失败');
        setPwdLoading(false);
        return;
      }
      message.success('修改成功，请重新登录');
      setPwdLoading(false);
      setPwdVisible(false);
      setOldPwd('');
      setNewPwd('');
      setConfirmPwd('');
      logout();
      navigate('/login');
    } catch (e: any) {
      setPwdLoading(false);
      message.error('网络错误');
    }
  };

  const menuItems = [
    {
      key: 'password',
      label: '修改密码',
      icon: <UserOutlined />
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <UserOutlined />
    }
  ];

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm w-full overflow-x-hidden">
      {/* 左侧区域 */}
      <div className="flex items-center flex-1">
        {/* 侧导航折叠展开按钮 */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors duration-200"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>

        {/* 面包屑导航 */}
        <div className="ml-3 min-w-0 overflow-hidden">
          <Breadcrumb items={generateBreadcrumbItems()} />
        </div>
      </div>

      {/* 右侧用户区域 */}
      <div className="flex items-center">
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          trigger={['click']}
          open={dropdownVisible}
          onOpenChange={setDropdownVisible}
          placement="bottomRight"
        >
          <div className="flex items-center cursor-pointer hover:bg-gray-50 px-3 py-2 rounded transition-colors duration-200">
            {/* 用户头像 */}
            <Avatar
              size={40}
              icon={<UserOutlined />}
              className="bg-blue-500"
              style={{ marginRight: '12px' }}
            />
            
            {/* 当前用户名称 */}
            <span className="text-sm text-gray-700">
              {user?.username || '用户'}
            </span>
          </div>
        </Dropdown>
        {pwdVisible && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">修改密码</h3>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => setPwdVisible(false)}>×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">请输入旧密码</label>
                  <input type="password" className="w-full border rounded-lg px-3 py-2" value={oldPwd} onChange={e => setOldPwd(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">请输入新密码</label>
                  <input type="password" className="w-full border rounded-lg px-3 py-2" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">请确认新密码</label>
                  <input type="password" className="w-full border rounded-lg px-3 py-2" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button className="px-4 py-2 rounded-lg border" onClick={() => setPwdVisible(false)}>取消</button>
                <button className={`px-4 py-2 rounded-lg text-white ${pwdLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={pwdLoading} onClick={submitChangePassword}>
                  {pwdLoading ? '提交中...' : '确定'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
