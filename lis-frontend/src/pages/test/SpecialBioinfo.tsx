import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { SpecialBioinfoSearchPanel } from '@/components/test/SpecialBioinfoSearchPanel';
import { SpecialBioinfoActionBar } from '@/components/test/SpecialBioinfoActionBar';
import { SpecialBioinfoTable } from '@/components/test/SpecialBioinfoTable';
import { useSpecialBioinfoStore } from '@/stores/specialBioinfo';
const SpecialBioinfo: React.FC = () => {
  const { query, pagination, setPagination } = useSpecialBioinfoStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <SpecialBioinfoSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <SpecialBioinfoActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="生信分析任务" size="small" styles={{ body: { padding: 16 } }}>
        <SpecialBioinfoTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default SpecialBioinfo;