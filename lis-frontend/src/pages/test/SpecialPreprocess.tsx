import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { SpecialPreprocessSearchPanel } from '@/components/test/SpecialPreprocessSearchPanel';
import { SpecialPreprocessActionBar } from '@/components/test/SpecialPreprocessActionBar';
import { SpecialPreprocessTable } from '@/components/test/SpecialPreprocessTable';
import { useSpecialPreprocessStore } from '@/stores/specialPreprocess';
const SpecialPreprocess: React.FC = () => {
  const { query, pagination, setPagination } = useSpecialPreprocessStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <SpecialPreprocessSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <SpecialPreprocessActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="预处理任务" size="small" styles={{ body: { padding: 16 } }}>
        <SpecialPreprocessTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default SpecialPreprocess;