import React, { useEffect } from 'react';
import { Card, Pagination, Row, Col } from 'antd';
import { MsAuditSearchPanel } from '@/components/test/MsAuditSearchPanel';
import { MsAuditActionBar } from '@/components/test/MsAuditActionBar';
import { MsAuditLeftTable } from '@/components/test/MsAuditLeftTable';
import { MsAuditRightTable } from '@/components/test/MsAuditRightTable';
import { useMsAuditStore } from '@/stores/msAudit';
const MsAudit: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useMsAuditStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <MsAuditSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <MsAuditActionBar onQuery={handleSearch} onReset={handleReset} />
      <Row gutter={16}>
        <Col span={12}>
          <Card title="质谱数据审核任务" size="small" styles={{ body: { padding: 16 } }}>
            <MsAuditLeftTable />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="质谱结果与谱图" size="small" styles={{ body: { padding: 16 } }}>
            <MsAuditRightTable />
          </Card>
        </Col>
      </Row>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default MsAudit;
