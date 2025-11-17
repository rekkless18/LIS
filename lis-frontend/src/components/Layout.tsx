import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/**
 * 布局组件
 * 整合顶标题栏、侧导航和内容区域
 * 内容区域显示为全白色背景
 */
export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  /**
   * 切换侧边栏折叠状态
   */
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className="h-screen flex bg-gray-50"
      style={{ overflowX: 'hidden' }}
    >
      {/* 侧导航 */}
      <Sidebar collapsed={collapsed} />
      
      {/* 主内容区域 */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: collapsed ? '64px' : '208px',
          width: collapsed ? 'calc(100vw - 64px)' : 'calc(100vw - 208px)'
        }}
      >
        {/* 顶标题栏 */}
        <Header collapsed={collapsed} onToggle={toggleSidebar} />
        
        {/* 内容区域 - 全白色背景 */}
        <main className="flex-1 p-6 bg-white overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
