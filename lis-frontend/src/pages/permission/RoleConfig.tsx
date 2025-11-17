import React, { useEffect } from 'react'
import { Card, Pagination } from 'antd'
import { RoleSearchPanel } from '@/components/permission/RoleSearchPanel'
import { RoleActionBar } from '@/components/permission/RoleActionBar'
import { RoleTable } from '@/components/permission/RoleTable'
import { useRoleConfigStore } from '@/stores/permissionRole'

const RoleConfig: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useRoleConfigStore()
  useEffect(() => { query() }, [])
  const handleSearch = () => { setPagination({ current: 1 }); query() }
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query() }
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query() }
  return (
    <div className="p-4">
      <RoleSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <RoleActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="角色配置列表" size="small" styles={{ body: { padding: 16 } }}>
        <RoleTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  )
}

export default RoleConfig

