import React, { useEffect } from 'react';
import { Card, Pagination, Row, Col } from 'antd';
import { MsExperimentSearchPanel } from '@/components/test/MsExperimentSearchPanel';
import { MsExperimentActionBar } from '@/components/test/MsExperimentActionBar';
import { MsExperimentLeftTable } from '@/components/test/MsExperimentLeftTable';
import { MsExperimentRightTable } from '@/components/test/MsExperimentRightTable';
import { useMsExperimentStore } from '@/stores/msExperiment';
const MsExperiment: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useMsExperimentStore();
  useEffect(() => { query(); }, []);
  const handleSearch = () => { setPagination({ current: 1 }); query(); };
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query(); };
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query(); };
  return (
    <div className="p-4">
      <MsExperimentSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <MsExperimentActionBar onQuery={handleSearch} onReset={handleReset} />
      <Row gutter={16}>
        <Col span={12}>
          <Card title="质谱实验任务" size="small" styles={{ body: { padding: 16 } }}>
            <MsExperimentLeftTable />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="质谱检测项结果" size="small" styles={{ body: { padding: 16 } }}>
            <MsExperimentRightTable />
          </Card>
        </Col>
      </Row>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  );
};
export default MsExperiment;
