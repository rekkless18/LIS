import React, { useEffect, useRef } from 'react';
import { Card, Pagination } from 'antd';
import { EquipSearchPanel } from '@/components/manage/EquipSearchPanel';
import { EquipActionBar } from '@/components/manage/EquipActionBar';
import { EquipTable } from '@/components/manage/EquipTable';
import { useEquipmentStore } from '@/stores/equipment';

/**
 * 设备管理页面占位组件
 * 功能：展示设备管理的占位内容，便于路由验证
 * 参数：无
 * 返回值：React.ReactElement，用于渲染设备管理页面内容
 * 用途：作为导航跳转和首页入口的目标页面，占位后续功能实现
 */
const EquipmentManage: React.FC = (): React.ReactElement => {
  const { query, pagination, setPagination, resetFilters } = useEquipmentStore();
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    query();
  }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <EquipSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <EquipActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="设备档案列表" size="small" styles={{ body: { padding: 16 } }}>
        <EquipTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};

export default EquipmentManage;
