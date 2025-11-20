import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEquipmentStore } from '@/stores/equipment';

/** 函数功能：设备管理数据表组件；参数：无；返回值：React元素；用途：渲染数据列表区 */
export const EquipTable: React.FC = () => {
  const { filteredDevices, selectedRowKeys, setSelectedRowKeys } = useEquipmentStore();
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) };
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }); };
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '设备编号', dataIndex: 'deviceNo', key: 'deviceNo', width: 140, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-36">{text}</span></Tooltip>) },
    { title: '设备名称', dataIndex: 'deviceName', key: 'deviceName', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '设备类型', dataIndex: 'deviceType', key: 'deviceType', width: 120 },
    { title: '设备状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '设备位置', dataIndex: 'location', key: 'location', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '生产厂家', dataIndex: 'manufacturer', key: 'manufacturer', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text || ''}</span></Tooltip>) },
    { title: '购置日期', dataIndex: 'purchaseDate', key: 'purchaseDate', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) },
    { title: '上次维护日期', dataIndex: 'lastMaintenanceDate', key: 'lastMaintenanceDate', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) },
    { title: '报废日期', dataIndex: 'scrapDate', key: 'scrapDate', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredDevices} scroll={{ x: totalWidth }} pagination={false} />);
};

