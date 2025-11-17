import React, { useEffect } from 'react';
import { Card, Pagination, Row, Col } from 'antd';
import { SpecialAuditSearchPanel } from '@/components/test/SpecialAuditSearchPanel';
import { SpecialAuditActionBar } from '@/components/test/SpecialAuditActionBar';
import { SpecialAuditLeftTable } from '@/components/test/SpecialAuditLeftTable';
import { SpecialAuditRightTable } from '@/components/test/SpecialAuditRightTable';
import { useSpecialAuditStore } from '@/stores/specialAudit';
const SpecialAudit: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useSpecialAuditStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <SpecialAuditSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <SpecialAuditActionBar onQuery={handleSearch} onReset={handleReset} />
      <Row gutter={16}>
        <Col span={12}>
          <Card title="特检数据审核任务" size="small" styles={{ body: { padding: 16 } }}>
            <SpecialAuditLeftTable />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="检测项结果与审核记录" size="small" styles={{ body: { padding: 16 } }}>
            <SpecialAuditRightTable />
          </Card>
        </Col>
      </Row>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default SpecialAudit;
