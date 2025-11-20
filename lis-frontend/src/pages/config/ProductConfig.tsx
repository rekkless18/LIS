import React, { useEffect, useRef } from 'react';
import { Card, Pagination } from 'antd';
import { ProductSearchPanel } from '@/components/config/ProductSearchPanel';
import { ProductActionBar } from '@/components/config/ProductActionBar';
import { ProductTable } from '@/components/config/ProductTable';
import { useProductConfigStore } from '@/stores/configProduct';

const ProductConfig: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useProductConfigStore();
  const didInitRef = useRef(false);
  /**
   * 功能描述：页面挂载时触发一次查询，避免开发模式下StrictMode导致的双调用
   * 参数说明：无
   * 返回值类型及用途：无；用于初始化列表数据
   */
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    query();
  }, []);
  /** 功能描述：执行搜索；参数说明：无；返回值类型及用途：无，用于触发查询 */
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  /** 功能描述：重置筛选并查询；参数说明：无；返回值类型及用途：无，用于恢复默认筛选 */
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  /** 功能描述：分页切换并查询；参数说明：page 当前页，pageSize 每页条数；返回值：无；用途：更新分页与列表 */
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

