import React, { useEffect } from 'react';
import { Row, Col, Card, Pagination } from 'antd';
import { RoutineSearchPanel } from '@/components/test/RoutineSearchPanel';
import { RoutineActionBar } from '@/components/test/RoutineActionBar';
import { RoutineLeftTable } from '@/components/test/RoutineLeftTable';
import { RoutineRightTable } from '@/components/test/RoutineRightTable';
import { useRoutineStore } from '@/stores/routine';
const Routine: React.FC = () => {
  const { queryTasks, pagination, setPagination } = useRoutineStore();
  useEffect(() => { queryTasks(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); queryTasks(); };
  const handleReset = () => { setPagination({ current: 1 }); queryTasks(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); queryTasks(); };
  return (
    <div className="p-4">
      <RoutineSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <RoutineActionBar onQuery={handleSearch} onReset={handleReset} />
      <Row gutter={16}>
        <Col span={12}><Card title="样本检测任务" size="small" styles={{ body: { padding: 16 } }}><RoutineLeftTable /></Card></Col>
        <Col span={12}><Card title="单样本检测结果" size="small" styles={{ body: { padding: 16 } }}><RoutineRightTable /></Card></Col>
      </Row>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} showQuickJumper={{ goButton: <span className="ml-2">跳转</span> }} size="small" />
      </div>
    </div>
  );
};
export default Routine;
