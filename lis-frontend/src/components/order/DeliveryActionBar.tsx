import React from 'react'
import { Button, Space, Tooltip, message } from 'antd'
import { DownloadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons'
import { useReportDeliveryStore } from '@/stores/reportDelivery'

interface Props { onSearch: () => void; onReset: () => void }

const DeliveryActionBar: React.FC<Props> = ({ onSearch, onReset }) => {
  const { selectedRowKeys, filtered, download } = useReportDeliveryStore()
  const hasSelection = selectedRowKeys.length > 0
  const allAllowed = selectedRowKeys.every(k => {
    const item = filtered.find(x => x.id === k)
    return item && item.status !== 'blocked'
  })

  const handleDownload = () => {
    if (!hasSelection || !allAllowed) {
      message.warning('请至少选择一个报告且所有选择的报告状态不能为卡报告')
      return
    }
    download(selectedRowKeys)
    message.success('下载成功')
    onSearch()
  }

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <Space>
          <Tooltip title={hasSelection && allAllowed ? '' : '请至少选择一个报告且所有选择的报告状态不能为卡报告'}>
            <Button icon={<DownloadOutlined />} disabled={!hasSelection || !allAllowed} onClick={handleDownload}>下载</Button>
          </Tooltip>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onReset}>重置</Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>查询</Button>
        </Space>
      </div>
    </div>
  )
}

export default DeliveryActionBar

