import React, { useEffect } from 'react'
import { Card, Pagination } from 'antd'
import { ApprovalSearchPanel } from '@/components/approval/ApprovalSearchPanel'
import { ApprovalActionBar } from '@/components/approval/ApprovalActionBar'
import { ApprovalTable } from '@/components/approval/ApprovalTable'
import { useApprovalStore } from '@/stores/approval'

const ApprovalQuery: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useApprovalStore()
  useEffect(() => { query() }, [])
  const handleSearch = () => { setPagination({ current: 1 }); query() }
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query() }
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query() }
  return (
    <div className="p-4">
      <ApprovalSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <ApprovalActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="审批列表" size="small" styles={{ body: { padding: 16 } }}>
        <ApprovalTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  )
}

export default ApprovalQuery

