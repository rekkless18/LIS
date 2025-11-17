import React, { useEffect } from 'react'
import DeliverySearchPanel from '@/components/order/DeliverySearchPanel'
import DeliveryActionBar from '@/components/order/DeliveryActionBar'
import DeliveryTable from '@/components/order/DeliveryTable'
import { PaginationBar } from '@/components/order/PaginationBar'
import { useReportDeliveryStore } from '@/stores/reportDelivery'

const DeliveryDownload: React.FC = () => {
  const { query, resetFilters, setPagination, setSelectedRowKeys } = useReportDeliveryStore()

  useEffect(() => { query() }, [])

  const handleSearch = () => { query() }
  const handleReset = () => { resetFilters(); query() }
  const handlePageChange = (p: number, s: number) => { setPagination({ current: p, pageSize: s }); query() }
  const handleRowSelect = (keys: React.Key[]) => { setSelectedRowKeys(keys as string[]) }

  return (
    <div className="h-full flex flex-col">
      <DeliverySearchPanel onSearch={handleSearch} onReset={handleReset} />
      <DeliveryActionBar onSearch={handleSearch} onReset={handleReset} />
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <DeliveryTable onRowSelect={handleRowSelect} />
      </div>
      <PaginationBar onPageChange={handlePageChange} />
    </div>
  )
}

export default DeliveryDownload
