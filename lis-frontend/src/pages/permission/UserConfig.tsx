import React, { useEffect } from 'react'
import { Card, Pagination } from 'antd'
import { UserSearchPanel } from '@/components/permission/UserSearchPanel'
import { UserActionBar } from '@/components/permission/UserActionBar'
import { UserTable } from '@/components/permission/UserTable'
import { useUserConfigStore } from '@/stores/permissionUser'

const UserConfig: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useUserConfigStore()
  useEffect(() => { query() }, [])
  const handleSearch = () => { setPagination({ current: 1 }); query() }
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query() }
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query() }
  return (
    <div className="p-4">
      <UserSearchPanel onSearch={handleSearch} onReset={handleReset} />
      <UserActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="用户配置列表" size="small" styles={{ body: { padding: 16 } }}>
        <UserTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  )
}

export default UserConfig

