import React, { useEffect } from 'react'
import { Card, Pagination } from 'antd'
import { ApprovalFlowSearchPanel } from '@/components/config/ApprovalFlowSearchPanel'
import { ApprovalFlowActionBar } from '@/components/config/ApprovalFlowActionBar'
import { ApprovalFlowTable } from '@/components/config/ApprovalFlowTable'
import { useApprovalConfigStore } from '@/stores/approvalConfig'

const ApprovalConfig: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useApprovalConfigStore()
  useEffect(() => { query() }, [])
  const handleSearch = () => { setPagination({ current: 1 }); query() }
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query() }
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query() }
  return (
    <div className="p-4">
      <ApprovalFlowSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <ApprovalFlowActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="审批流程配置列表" size="small" styles={{ body: { padding: 16 } }}>
        <ApprovalFlowTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  )
}

export default ApprovalConfig

