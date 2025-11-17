import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { SpecialSequencingSearchPanel } from '@/components/test/SpecialSequencingSearchPanel';
import { SpecialSequencingActionBar } from '@/components/test/SpecialSequencingActionBar';
import { SpecialSequencingTable } from '@/components/test/SpecialSequencingTable';
import { useSpecialSequencingStore } from '@/stores/specialSequencing';
const SpecialSequencing: React.FC = () => {
  const { query, pagination, setPagination } = useSpecialSequencingStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <SpecialSequencingSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <SpecialSequencingActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="测序上机批次" size="small" styles={{ body: { padding: 16 } }}>
        <SpecialSequencingTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default SpecialSequencing;