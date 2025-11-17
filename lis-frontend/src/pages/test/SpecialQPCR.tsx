import React, { useEffect } from 'react';
import { Card, Pagination, Row, Col } from 'antd';
import { SpecialQPCRSearchPanel } from '@/components/test/SpecialQPCRSearchPanel';
import { SpecialQPCRActionBar } from '@/components/test/SpecialQPCRActionBar';
import { SpecialQPCRLeftTable } from '@/components/test/SpecialQPCRLeftTable';
import { SpecialQPCRRightTable } from '@/components/test/SpecialQPCRRightTable';
import { useSpecialQPCRStore } from '@/stores/specialQPCR';
const SpecialQPCR: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useSpecialQPCRStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <SpecialQPCRSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <SpecialQPCRActionBar onQuery={handleSearch} onReset={handleReset} />
      <Row gutter={16}>
        <Col span={12}>
          <Card title="QPCR分析任务" size="small" styles={{ body: { padding: 16 } }}>
            <SpecialQPCRLeftTable />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="检测项结果与曲线" size="small" styles={{ body: { padding: 16 } }}>
            <SpecialQPCRRightTable />
          </Card>
        </Col>
      </Row>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default SpecialQPCR;
