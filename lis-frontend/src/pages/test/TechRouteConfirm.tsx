import React, { useEffect } from 'react';
import { Row, Col, Card, Pagination } from 'antd';
import { TechRouteSearchPanel } from '@/components/test/TechRouteSearchPanel';
import { TechRouteActionBar } from '@/components/test/TechRouteActionBar';
import { TechRouteTable } from '@/components/test/TechRouteTable';
import { useTechRouteStore } from '@/stores/techRoute';
const TechRouteConfirm: React.FC = () => {
  const { query, pagination, setPagination } = useTechRouteStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <TechRouteSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <TechRouteActionBar onQuery={handleSearch} onReset={handleReset} />
      <Row gutter={16}>
        <Col span={24}><Card title="技术路线任务" size="small" styles={{ body: { padding: 16 } }}><TechRouteTable /></Card></Col>
      </Row>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default TechRouteConfirm;
