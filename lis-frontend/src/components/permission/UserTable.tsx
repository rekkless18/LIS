import React from 'react'
import { Table, Tooltip, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useUserConfigStore } from '@/stores/permissionUser'

export const UserTable: React.FC = () => {
  const { filteredItems, selectedRowKeys, setSelectedRowKeys } = useUserConfigStore()
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) }
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) }
  const join = (arr?: string[]) => (arr || []).join(', ')
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '用户账号', dataIndex: 'account', key: 'account', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '用户姓名', dataIndex: 'name', key: 'name', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '用户类型', dataIndex: 'userType', key: 'userType', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text || ''}</span></Tooltip>) },
    { title: '绑定角色', dataIndex: 'roles', key: 'roles', width: 240, render: (_: any, record: any) => {
      const names: string[] = Array.isArray(record.roles) ? record.roles : []
      return names.length ? (
        <div className="flex flex-wrap gap-1">
          {names.map((n: string) => (<Tag key={n} color="blue">{n}</Tag>))}
        </div>
      ) : (<span />)
    } },
    { title: '最后登录时间', dataIndex: 'lastLoginTime', key: 'lastLoginTime', width: 180, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) },
    { title: '最后修改密码时间', dataIndex: 'lastPasswordChange', key: 'lastPasswordChange', width: 180, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) }
  ]
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0)
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />)
}

