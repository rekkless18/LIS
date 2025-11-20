import React, { useEffect, useRef } from 'react';
import { Card, Pagination } from 'antd';
import { CustomerSearchPanel } from '@/components/config/CustomerSearchPanel';
import { CustomerActionBar } from '@/components/config/CustomerActionBar';
import { CustomerTable } from '@/components/config/CustomerTable';
import { useCustomerConfigStore } from '@/stores/configCustomer';

const CustomerConfig: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useCustomerConfigStore();
  const mountedRef = useRef(false);
  useEffect(() => { if (mountedRef.current) return; mountedRef.current = true; query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <CustomerSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <CustomerActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="客户配置列表" size="small" styles={{ body: { padding: 16 } }}>
        <CustomerTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};

export default CustomerConfig;

