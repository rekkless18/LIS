import React from 'react'
import { Table, Tooltip, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useApprovalConfigStore } from '@/stores/approvalConfig'

export const ApprovalFlowTable: React.FC = () => {
  const { filteredItems, selectedRowKeys, setSelectedRowKeys } = useApprovalConfigStore()
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) }
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '审批流程编号', dataIndex: 'flowCode', key: 'flowCode', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '审批流程名称', dataIndex: 'flowName', key: 'flowName', width: 180, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-44">{text}</span></Tooltip>) },
    { title: '审批流程类型', dataIndex: 'flowType', key: 'flowType', width: 140 },
    { title: '审批流程描述', dataIndex: 'description', key: 'description', width: 220, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-52">{text || ''}</span></Tooltip>) },
    { title: '审批级别', dataIndex: 'level', key: 'level', width: 120 },
    { title: '审批流程状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '创建日期', dataIndex: 'createdAt', key: 'createdAt', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) },
    { title: '审批节点', dataIndex: 'nodes', key: 'nodes', width: 240, render: (_: any, record: any) => {
      const labels: string[] = (record.nodes || []).map((n: any) => n.approverType)
      return labels.length ? (<div className="flex flex-wrap gap-1">{labels.map((t, i) => (<Tag key={`${t}-${i}`} color="blue">{t}</Tag>))}</div>) : (<span />)
    } }
  ]
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0)
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />)
}