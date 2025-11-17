import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEnvironmentStore } from '@/stores/environment';

/** 函数功能：环境管理数据表组件；参数：无；返回值：React元素；用途：渲染数据列表区 */
export const EnvTable: React.FC = () => {
  const { filteredRooms, selectedRowKeys, setSelectedRowKeys } = useEnvironmentStore();
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) };
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '房间号', dataIndex: 'roomNo', key: 'roomNo', width: 120, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-28">{text}</span></Tooltip>) },
    { title: '房间位置', dataIndex: 'roomLocation', key: 'roomLocation', width: 200, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-48">{text}</span></Tooltip>) },
    { title: '环境状态', dataIndex: 'status', key: 'status', width: 100 },
    { title: '防护等级', dataIndex: 'protectionLevel', key: 'protectionLevel', width: 100 },
    { title: '温度', dataIndex: 'temperature', key: 'temperature', width: 100, render: (v: number) => (<Tooltip title={v}><span>{v ?? ''}</span></Tooltip>) },
    { title: '湿度', dataIndex: 'humidity', key: 'humidity', width: 100, render: (v: number) => (<Tooltip title={v}><span>{v ?? ''}</span></Tooltip>) },
    { title: '压强', dataIndex: 'pressure', key: 'pressure', width: 100, render: (v: number) => (<Tooltip title={v}><span>{v ?? ''}</span></Tooltip>) }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredRooms} scroll={{ x: totalWidth }} pagination={false} />);
};

