import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { PackageSearchPanel } from '@/components/config/PackageSearchPanel';
import { PackageActionBar } from '@/components/config/PackageActionBar';
import { PackageTable } from '@/components/config/PackageTable';
import { usePackageConfigStore } from '@/stores/configPackage';

const PackageConfig: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = usePackageConfigStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <PackageSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <PackageActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="套餐配置列表" size="small" styles={{ body: { padding: 16 } }}>
        <PackageTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};

export default PackageConfig;

