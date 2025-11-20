import React, { useEffect, useRef } from 'react'
import { Card, Pagination } from 'antd'
import { InventorySearchPanel } from '@/components/inventory/InventorySearchPanel'
import { InventoryActionBar } from '@/components/inventory/InventoryActionBar'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { useInventoryStore } from '@/stores/inventory'

const InventoryQuery: React.FC = () => {
  const { query, pagination, setPagination, resetFilters } = useInventoryStore()
  const mountedRef = useRef(false)
  useEffect(() => { if (mountedRef.current) return; mountedRef.current = true; query() }, [])
  const handleSearch = () => { setPagination({ current: 1 }); query() }
  const handleReset = () => { resetFilters(); setPagination({ current: 1 }); query() }
  const onPageChange = (page: number, pageSize?: number) => { setPagination({ current: page, pageSize: pageSize || pagination.pageSize }); query() }
  return (
    <div className="p-4">
      <InventorySearchPanel onSearch={handleSearch} onReset={handleReset} />
      <InventoryActionBar onQuery={handleSearch} onReset={handleReset} />
      <Card title="库存列表" size="small" styles={{ body: { padding: 16 } }}>
        <InventoryTable />
      </Card>
      <div className="py-4">
        <Pagination current={pagination.current} pageSize={pagination.pageSize} total={pagination.total} showSizeChanger={pagination.showSizeChanger} pageSizeOptions={pagination.pageSizeOptions} onChange={onPageChange} showTotal={(total) => (<span>共 {total} 条，第 {pagination.current} 页</span>)} size="small" />
      </div>
    </div>
  )
}

export default InventoryQuery

