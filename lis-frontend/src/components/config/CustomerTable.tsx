import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCustomerConfigStore } from '@/stores/configCustomer';

export const CustomerTable: React.FC = () => {
  const { filteredItems, selectedRowKeys, setSelectedRowKeys } = useCustomerConfigStore();
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) };
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }); };
  const join = (arr?: string[]) => (arr || []).join(', ');
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '客户编码', dataIndex: 'customerCode', key: 'customerCode', width: 140, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-36">{text}</span></Tooltip>) },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '客户类型', dataIndex: 'customerType', key: 'customerType', width: 140 },
    { title: '区域', dataIndex: 'regions', key: 'regions', width: 200, render: (arr: string[]) => (<Tooltip title={join(arr)}><span className="truncate block max-w-52">{join(arr)}</span></Tooltip>) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '创建日期', dataIndex: 'createdAt', key: 'createdAt', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />);
};

