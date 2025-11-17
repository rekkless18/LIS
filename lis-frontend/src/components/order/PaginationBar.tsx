import React from 'react';
import { Pagination } from 'antd';
import { useOrderStore } from '@/stores/order';

interface PaginationBarProps {
  onPageChange: (page: number, pageSize: number) => void;
}

export const PaginationBar: React.FC<PaginationBarProps> = ({ onPageChange }) => {
  const { pagination, setPagination } = useOrderStore();

  const handlePageChange = (page: number, pageSize?: number) => {
    const newPagination = {
      ...pagination,
      current: page,
      pageSize: pageSize || pagination.pageSize
    };
    setPagination(newPagination);
    onPageChange(page, newPagination.pageSize);
  };

  const showTotal = (total: number, range: [number, number]) => (
    <span>
      共 {total} 条，第 {pagination.current} 页
    </span>
  );

  return (
    <div className="flex justify-start items-center py-4">
      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        showTotal={showTotal}
        showSizeChanger={pagination.showSizeChanger}
        pageSizeOptions={pagination.pageSizeOptions}
        onChange={handlePageChange}
        showQuickJumper={{ goButton: <span className="ml-2">跳转</span> }}
        size="small"
      />
    </div>
  );
};
