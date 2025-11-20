import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { pathPermissionMap } from '@/router';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/**
 * 布局组件
 * 整合顶标题栏、侧导航和内容区域
 * 内容区域显示为全白色背景
 */
export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();

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
          {(() => {
            let perm = pathPermissionMap[location.pathname];
            if (!perm) {
              for (const [pattern, p] of Object.entries(pathPermissionMap)) {
                const re = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
                if (re.test(location.pathname)) { perm = p; break; }
              }
            }
            if (perm) {
              const alt = perm.endsWith('.view') ? perm.replace(/\.view$/, '') : ''
              const has = user?.permissions?.includes(perm) || (alt && user?.permissions?.includes(alt))
              if (!has) {
                return (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    无权限，请联系系统管理员
                  </div>
                );
              }
            }
            return <Outlet />;
          })()}
        </main>
      </div>
    </div>
  );
};
