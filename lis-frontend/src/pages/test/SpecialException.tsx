import React, { useEffect } from 'react';
import { Card, Pagination, Row, Col } from 'antd';
import { SpecialExceptionSearchPanel } from '@/components/test/SpecialExceptionSearchPanel';
import { SpecialExceptionActionBar } from '@/components/test/SpecialExceptionActionBar';
import { SpecialExceptionLeftTable } from '@/components/test/SpecialExceptionLeftTable';
import { SpecialExceptionRightTable } from '@/components/test/SpecialExceptionRightTable';
import { useSpecialExceptionStore } from '@/stores/specialException';
const SpecialException: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useSpecialExceptionStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <SpecialExceptionSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <SpecialExceptionActionBar onQuery={handleSearch} onReset={handleReset} />
      <Row gutter={16}>
        <Col span={12}>
          <Card title="特检异常任务" size="small" styles={{ body: { padding: 16 } }}>
            <SpecialExceptionLeftTable />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="异常结果与历史记录" size="small" styles={{ body: { padding: 16 } }}>
            <SpecialExceptionRightTable />
          </Card>
        </Col>
      </Row>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default SpecialException;
