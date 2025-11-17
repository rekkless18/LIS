import React, { useEffect } from 'react';
import LogisticsSearchPanel from '@/components/logistics/LogisticsSearchPanel';
import LogisticsActionBar from '@/components/logistics/LogisticsActionBar';
import LogisticsTable from '@/components/logistics/LogisticsTable';
import { PaginationBar } from '@/components/order/PaginationBar';
import { useLogisticsStore } from '@/stores/logistics';

const LogisticsQuery: React.FC = () => {
  const { query, resetFilters, setPagination, setSelectedRowKeys } = useLogisticsStore();

  useEffect(() => { query(); }, []);

  const handleSearch = () => { query(); };
  const handleReset = () => { resetFilters(); query(); };
  const handlePageChange = (p: number, s: number) => { setPagination({ current: p, pageSize: s }); query(); };
  const handleRowSelect = (keys: React.Key[]) => { setSelectedRowKeys(keys as string[]); };

  return (
    <div className="h-full flex flex-col">
      <LogisticsSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <LogisticsActionBar onSearch={handleSearch} onReset={handleReset} />
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <LogisticsTable onRowSelect={handleRowSelect} />
      </div>
      <PaginationBar onPageChange={handlePageChange} />
    </div>
  );
};

export default LogisticsQuery;
