import React, { useEffect } from 'react';
import { message } from 'antd';
import { useOrderStore } from '@/stores/order';
import { OrderSearchPanel } from '@/components/order/OrderSearchPanel';
import { OrderActionBar } from '@/components/order/OrderActionBar';
import { OrderTable } from '@/components/order/OrderTable';
import { PaginationBar } from '@/components/order/PaginationBar';

const OrderQuery: React.FC = () => {
  const { 
    filteredOrders, 
    selectedRowKeys, 
    setSelectedRowKeys, 
    queryOrders, 
    resetFilters,
    setFilters,
    setPagination,
    pagination 
  } = useOrderStore();

  useEffect(() => {
    // Initialize with some mock data if empty
    queryOrders();
  }, []);

  const handleSearch = () => {
    queryOrders();
  };

  const handleReset = () => {
    resetFilters();
    queryOrders();
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({ current: page, pageSize });
    queryOrders();
  };

  const handleRowSelect = (keys: React.Key[]) => {
    setSelectedRowKeys(keys as string[]);
  };

  return (
    <div className="h-full flex flex-col">
      <OrderSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <OrderActionBar onSearch={handleSearch} onReset={handleReset} />
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <OrderTable onRowSelect={handleRowSelect} />
      </div>
      <PaginationBar onPageChange={handlePageChange} />
    </div>
  );
};

export default OrderQuery;
