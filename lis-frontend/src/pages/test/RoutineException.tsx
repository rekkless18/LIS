import React, { useEffect } from 'react';
import { Row, Col, Card, Pagination } from 'antd';
import { RoutineExceptionSearchPanel } from '@/components/test/RoutineExceptionSearchPanel';
import { RoutineExceptionActionBar } from '@/components/test/RoutineExceptionActionBar';
import { RoutineExceptionTable } from '@/components/test/RoutineExceptionTable';
import { useRoutineExceptionStore } from '@/stores/routineException';
const RoutineException: React.FC = () => {
  const { query, pagination, setPagination } = useRoutineExceptionStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <RoutineExceptionSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <RoutineExceptionActionBar onQuery={handleSearch} onReset={handleReset} />
      <Row gutter={16}>
        <Col span={24}><Card title="异常记录" size="small" styles={{ body: { padding: 16 } }}><RoutineExceptionTable /></Card></Col>
      </Row>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default RoutineException;
