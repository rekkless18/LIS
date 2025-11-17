import React, { useEffect } from 'react';
import SamplesSearchPanel from '@/components/samples/SamplesSearchPanel';
import SamplesActionBar from '@/components/samples/SamplesActionBar';
import SamplesTable from '@/components/samples/SamplesTable';
import { PaginationBar } from '@/components/order/PaginationBar';
import { useSampleStore } from '@/stores/samples';

const SamplesQuery: React.FC = () => {
  const { query, resetFilters, setPagination, setSelectedRowKeys } = useSampleStore();

  useEffect(() => { query(); }, []);

  const handleSearch = () => { query(); };
  const handleReset = () => { resetFilters(); query(); };
  const handlePageChange = (p: number, s: number) => { setPagination({ current: p, pageSize: s }); query(); };
  const handleRowSelect = (keys: React.Key[]) => { setSelectedRowKeys(keys as string[]); };

  return (
    <div className="h-full flex flex-col">
      <SamplesSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <SamplesActionBar onSearch={handleSearch} onReset={handleReset} />
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <SamplesTable onRowSelect={handleRowSelect} />
      </div>
      <PaginationBar onPageChange={handlePageChange} />
    </div>
  );
};

export default SamplesQuery;
