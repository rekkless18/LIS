import React from 'react'
import { Table, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useApprovalStore } from '@/stores/approval'

export const ApprovalTable: React.FC = () => {
  const { filteredItems, selectedRowKeys, setSelectedRowKeys } = useApprovalStore()
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) }
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '审批单编号', dataIndex: 'approvalNo', key: 'approvalNo', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '审批单类型', dataIndex: 'type', key: 'type', width: 140 },
    { title: '审批单状态', dataIndex: 'status', key: 'status', width: 140 },
    { title: '创建日期', dataIndex: 'createdDate', key: 'createdDate', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) },
    { title: '申请人', dataIndex: 'applicant', key: 'applicant', width: 140, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-36">{text}</span></Tooltip>) },
    { title: '标题', dataIndex: 'title', key: 'title', width: 200, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-48">{text}</span></Tooltip>) }
  ]
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0)
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />)
}

