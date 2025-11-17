import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRoutineStore } from '@/stores/routine';
export const RoutineRightTable: React.FC = () => {
  const { currentTask } = useRoutineStore();
  const data = currentTask?.items || [];
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '检测项名称', dataIndex: 'name', key: 'name', width: 180, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '检测项范围', dataIndex: 'range', key: 'range', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '检测项单位', dataIndex: 'unit', key: 'unit', width: 120, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-20">{text}</span></Tooltip>) },
    { title: '检测项结果', dataIndex: 'value', key: 'value', width: 140, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-32">{text}</span></Tooltip>) },
    { title: '检测项判读结果', dataIndex: 'interpretation', key: 'interpretation', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" columns={columns} dataSource={data} scroll={{ x: totalWidth }} pagination={false} />);
};
