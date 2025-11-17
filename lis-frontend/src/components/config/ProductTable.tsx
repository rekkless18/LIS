import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useProductConfigStore } from '@/stores/configProduct';

export const ProductTable: React.FC = () => {
  const { filteredItems, selectedRowKeys, setSelectedRowKeys } = useProductConfigStore();
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) };
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }); };
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '产品编码', dataIndex: 'productCode', key: 'productCode', width: 140, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-36">{text}</span></Tooltip>) },
    { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '产品类型', dataIndex: 'productType', key: 'productType', width: 140 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '检测项', dataIndex: 'testItems', key: 'testItems', width: 200, render: (arr: string[]) => (<Tooltip title={(arr || []).join(', ')}><span className="truncate block max-w-52">{(arr || []).join(', ')}</span></Tooltip>) },
    { title: '创建日期', dataIndex: 'createdAt', key: 'createdAt', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />);
};

