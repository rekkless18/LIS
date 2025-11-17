import React from 'react'
import { Table, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useInventoryStore } from '@/stores/inventory'

export const InventoryTable: React.FC = () => {
  const { filteredItems, selectedRowKeys, setSelectedRowKeys } = useInventoryStore()
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) }
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '物料编号', dataIndex: 'materialNo', key: 'materialNo', width: 140, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-36">{text}</span></Tooltip>) },
    { title: '物料名称', dataIndex: 'materialName', key: 'materialName', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '批次号', dataIndex: 'batchNo', key: 'batchNo', width: 140, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-36">{text}</span></Tooltip>) },
    { title: '创建日期', dataIndex: 'createdDate', key: 'createdDate', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) },
    { title: '有效期', dataIndex: 'validPeriod', key: 'validPeriod', width: 140, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-36">{text}</span></Tooltip>) },
    { title: '库存阈值', dataIndex: 'threshold', key: 'threshold', width: 120 },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 120 }
  ]
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0)
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />)
}

