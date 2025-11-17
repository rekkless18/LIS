import React from 'react'
import { Table, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useReportDeliveryStore } from '@/stores/reportDelivery'
import { useNavigate } from 'react-router-dom'

interface Props { onRowSelect: (keys: React.Key[]) => void }

const DeliveryTable: React.FC<Props> = ({ onRowSelect }) => {
  const navigate = useNavigate()
  const { filtered, selectedRowKeys, setSelectedRowKeys } = useReportDeliveryStore()

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => { setSelectedRowKeys(keys as string[]); onRowSelect(keys) }
  }

  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '报告编号', dataIndex: 'reportNo', key: 'reportNo', width: 160, fixed: 'left', render: (t: string, r: any) => (
      <Tooltip title={t}><span className="cursor-pointer text-blue-600 hover:text-blue-800 truncate block max-w-40" onClick={() => navigate(`/order/report/${r.id}/preview`)}>{t}</span></Tooltip>
    ) },
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 160, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
    { title: '样本编号', dataIndex: 'sampleNos', key: 'sampleNos', width: 200, render: (arr: string[]) => { const text = arr.join(', '); return (<Tooltip title={text}><span className="truncate block max-w-52">{text}</span></Tooltip>) } },
    { title: '产品名称', dataIndex: 'productNames', key: 'productNames', width: 200, render: (arr: string[]) => { const text = arr.join(', '); return (<Tooltip title={text}><span className="truncate block max-w-52">{text}</span></Tooltip>) } },
    { title: '报告状态', dataIndex: 'status', key: 'status', width: 120, render: (t: string) => { const map: any = { allow: '允许下载', blocked: '卡报告', downloaded: '已下载' }; const s = map[t] || t; return (<Tooltip title={s}><span className="truncate block max-w-20">{s}</span></Tooltip>) } },
    { title: '报告下载次数', dataIndex: 'downloadCount', key: 'downloadCount', width: 120, render: (t: number) => (<Tooltip title={String(t)}><span className="truncate block max-w-20">{t}</span></Tooltip>) }
  ]

  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0)

  return (
    <Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filtered} scroll={{ x: totalWidth }} pagination={false} />
  )
}

export default DeliveryTable
