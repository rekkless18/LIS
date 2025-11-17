import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { EnvSearchPanel } from '@/components/manage/EnvSearchPanel';
import { EnvActionBar } from '@/components/manage/EnvActionBar';
import { EnvTable } from '@/components/manage/EnvTable';
import { useEnvironmentStore } from '@/stores/environment';

/**
 * 环境管理页面占位组件
 * 功能：展示环境管理的占位内容，便于路由验证
 * 参数：无
 * 返回值：React.ReactElement，用于渲染环境管理页面内容
 * 用途：作为导航跳转和首页入口的目标页面，占位后续功能实现
 */
const EnvironmentManage: React.FC = (): React.ReactElement => {
  const { query, pagination, setPagination, resetFilters } = useEnvironmentStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <EnvSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <EnvActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="环境监控列表" size="small" styles={{ body: { padding: 16 } }}>
        <EnvTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};

export default EnvironmentManage;
