import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTechRouteStore } from '@/stores/techRoute';
export const TechRouteTable: React.FC = () => {
  const { filteredTasks, selectedRowKeys, setSelectedRowKeys } = useTechRouteStore();
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) };
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '样本编号', dataIndex: 'sampleNo', key: 'sampleNo', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40 text-blue-600">{text}</span></Tooltip>) },
    { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 200, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '技术路线', dataIndex: 'routeName', key: 'routeName', width: 200, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-20">{text}</span></Tooltip>) },
    { title: '到样时间', dataIndex: 'arriveTime', key: 'arriveTime', width: 160, render: (text: string) => { if (!text) return ''; const d = new Date(text); const s = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } },
    { title: '确认人', dataIndex: 'confirmer', key: 'confirmer', width: 100, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-20">{text}</span></Tooltip>) },
    { title: '确认时间', dataIndex: 'confirmTime', key: 'confirmTime', width: 160, render: (text: string) => { if (!text) return ''; const d = new Date(text); const s = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredTasks} scroll={{ x: totalWidth }} pagination={false} className="cursor-pointer" />);
};
