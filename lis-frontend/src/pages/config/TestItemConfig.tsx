import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { TestItemSearchPanel } from '@/components/config/TestItemSearchPanel';
import { TestItemActionBar } from '@/components/config/TestItemActionBar';
import { TestItemTable } from '@/components/config/TestItemTable';
import { useTestItemConfigStore } from '@/stores/configTestItem';

const TestItemConfig: React.FC = () => {
  const { query, pagination, setPagination } = useTestItemConfigStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <TestItemSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <TestItemActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="检测项配置列表" size="small" styles={{ body: { padding: 16 } }}>
        <TestItemTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};

export default TestItemConfig;

