import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRoutineStore } from '@/stores/routine';
export const RoutineLeftTable: React.FC = () => {
  const { filteredTasks, selectedRowKeys, setSelectedRowKeys, setCurrentTask } = useRoutineStore();
  const rowSelection = { selectedRowKeys, onChange: (newSelectedRowKeys: React.Key[]) => { setSelectedRowKeys(newSelectedRowKeys as string[]); } };
  const statusMap: Record<string, string> = { pending: '待实验', running: '进行中', exception: '异常', reviewing: '待审核', reviewed: '已审核', cancelled: '已取消' };
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '样本编号', dataIndex: 'sampleNo', key: 'sampleNo', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40 text-blue-600">{text}</span></Tooltip>) },
    { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 200, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '实验状态', dataIndex: 'status', key: 'status', width: 120, render: (status: string) => (<Tooltip title={statusMap[status]}><span className="truncate block max-w-20">{statusMap[status]}</span></Tooltip>) },
    { title: '审核状态', dataIndex: 'auditStatus', key: 'auditStatus', width: 120, render: (s: string) => { const label = s === 'pending' ? '待审核' : s === 'approved' ? '已审核' : '不通过'; return <Tooltip title={label}><span className="truncate block max-w-20">{label}</span></Tooltip>; } },
    { title: '实验设备', dataIndex: 'equipment', key: 'equipment', width: 150, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 160, render: (text: string) => { if (!text) return ''; const date = new Date(text); const formatted = date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return <Tooltip title={formatted}><span className="truncate block max-w-40">{formatted}</span></Tooltip>; } },
    { title: '完成时间', dataIndex: 'endTime', key: 'endTime', width: 160, render: (text: string) => { if (!text) return ''; const date = new Date(text); const formatted = date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return <Tooltip title={formatted}><span className="truncate block max-w-40">{formatted}</span></Tooltip>; } },
    { title: '审核时间', dataIndex: 'auditTime', key: 'auditTime', width: 160, render: (text: string) => { if (!text) return ''; const date = new Date(text); const formatted = date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return <Tooltip title={formatted}><span className="truncate block max-w-40">{formatted}</span></Tooltip>; } },
    { title: '审核人', dataIndex: 'auditor', key: 'auditor', width: 100, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-20">{text}</span></Tooltip>) }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (
    <Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredTasks} scroll={{ x: totalWidth }} pagination={false} onRow={(record) => ({ onClick: () => setCurrentTask(record) })} className="cursor-pointer" />
  );
};
