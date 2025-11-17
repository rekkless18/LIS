import React, { useEffect } from 'react';
import { Card, Pagination } from 'antd';
import { ProductSearchPanel } from '@/components/config/ProductSearchPanel';
import { ProductActionBar } from '@/components/config/ProductActionBar';
import { ProductTable } from '@/components/config/ProductTable';
import { useProductConfigStore } from '@/stores/configProduct';

const ProductConfig: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useProductConfigStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <ProductSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <ProductActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="产品配置列表" size="small" styles={{ body: { padding: 16 } }}>
        <ProductTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};

export default ProductConfig;

