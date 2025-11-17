import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { SpecialPreRunSearchPanel } from '@/components/test/SpecialPreRunSearchPanel';
import { SpecialPreRunActionBar } from '@/components/test/SpecialPreRunActionBar';
import { SpecialPreRunTable } from '@/components/test/SpecialPreRunTable';
import { useSpecialPreRunStore } from '@/stores/specialPreRun';
const SpecialPreRun: React.FC = () => {
  const { query, pagination, setPagination } = useSpecialPreRunStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <SpecialPreRunSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <SpecialPreRunActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="上机前处理任务" size="small" styles={{ body: { padding: 16 } }}>
        <SpecialPreRunTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default SpecialPreRun;
