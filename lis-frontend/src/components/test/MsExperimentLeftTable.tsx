import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMsExperimentStore } from '@/stores/msExperiment';

export const MsExperimentLeftTable: React.FC = () => {
  const { filteredTasks, selectedRowKeys, setSelectedRowKeys, setActiveTaskId } = useMsExperimentStore();
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) };
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '样本编号', dataIndex: 'sampleNo', key: 'sampleNo', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40 text-blue-600">{text}</span></Tooltip>) },
    { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 200 },
    { title: '实验状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '实验设备', dataIndex: 'equipment', key: 'equipment', width: 160 },
    { title: '开始时间', dataIndex: 'startTime', key: 'startTime', width: 160, render: (text: string) => { if (!text) return ''; const d = new Date(text); const s = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } },
    { title: '完成时间', dataIndex: 'endTime', key: 'endTime', width: 160, render: (text: string) => { if (!text) return ''; const d = new Date(text); const s = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } },
    { title: '审核时间', dataIndex: 'auditTime', key: 'auditTime', width: 160, render: (text: string) => { if (!text) return ''; const d = new Date(text); const s = d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredTasks} scroll={{ x: totalWidth }} pagination={false} onRow={(record) => ({ onClick: () => setActiveTaskId(record.id) })} />);
};

