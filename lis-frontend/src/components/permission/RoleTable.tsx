import React from 'react'
import { Table, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useRoleConfigStore } from '@/stores/permissionRole'

export const RoleTable: React.FC = () => {
  const { filteredItems, selectedRowKeys, setSelectedRowKeys } = useRoleConfigStore()
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) }
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) }
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '角色编码', dataIndex: 'roleCode', key: 'roleCode', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '角色名称', dataIndex: 'roleName', key: 'roleName', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '角色类型', dataIndex: 'roleType', key: 'roleType', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '绑定用户数', dataIndex: 'boundUserCount', key: 'boundUserCount', width: 140 },
    { title: '创建日期', dataIndex: 'createdAt', key: 'createdAt', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) }
  ]
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0)
  return (
    <Table
      rowKey="id"
      rowSelection={rowSelection}
      columns={columns}
      dataSource={filteredItems}
      scroll={{ x: totalWidth }}
      pagination={false}
    />
  )
}

