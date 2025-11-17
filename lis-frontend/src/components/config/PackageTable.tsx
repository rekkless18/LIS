import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { usePackageConfigStore } from '@/stores/configPackage';

export const PackageTable: React.FC = () => {
  const { filteredItems, selectedRowKeys, setSelectedRowKeys } = usePackageConfigStore();
  const rowSelection = { selectedRowKeys, onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]) };
  const fmt = (iso?: string) => { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }); };
  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '套餐编码', dataIndex: 'packageCode', key: 'packageCode', width: 140, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-36">{text}</span></Tooltip>) },
    { title: '套餐名称', dataIndex: 'packageName', key: 'packageName', width: 160, render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '套餐类型', dataIndex: 'packageType', key: 'packageType', width: 140 },
    { title: '产品名称', dataIndex: 'productNames', key: 'productNames', width: 200, render: (arr: string[]) => (<Tooltip title={(arr || []).join(', ')}><span className="truncate block max-w-52">{(arr || []).join(', ')}</span></Tooltip>) },
    { title: '状态', dataIndex: 'status', key: 'status', width: 120 },
    { title: '创建日期', dataIndex: 'createdAt', key: 'createdAt', width: 140, render: (text: string) => (<Tooltip title={fmt(text)}><span>{fmt(text)}</span></Tooltip>) }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />);
};

