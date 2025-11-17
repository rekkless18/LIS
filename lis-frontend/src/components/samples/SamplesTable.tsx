import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSampleStore } from '@/stores/samples';

interface Props { onRowSelect: (keys: React.Key[]) => void; }

const SamplesTable: React.FC<Props> = ({ onRowSelect }) => {
  const { filtered, selectedRowKeys, setSelectedRowKeys } = useSampleStore();

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => { setSelectedRowKeys(keys as string[]); onRowSelect(keys); }
  };

  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 160, fixed: 'left', render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
    { title: '样本编号', dataIndex: 'sampleNos', key: 'sampleNos', width: 200, render: (arr: string[]) => { const text = arr.join(', '); return (<Tooltip title={text}><span className="truncate block max-w-52">{text}</span></Tooltip>); } },
    { title: '样本类型', dataIndex: 'sampleTypes', key: 'sampleTypes', width: 160, render: (arr: string[]) => { const text = arr.join(', '); return (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>); } },
    { title: '产品名称', dataIndex: 'productNames', key: 'productNames', width: 200, render: (arr: string[]) => { const text = arr.join(', '); return (<Tooltip title={text}><span className="truncate block max-w-52">{text}</span></Tooltip>); } },
    { title: '采样时间', dataIndex: 'samplingTime', key: 'samplingTime', width: 160, render: (t: string) => { const d = new Date(t); const s = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`; return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } },
    { title: '样本状态', dataIndex: 'status', key: 'status', width: 120, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-20">{t}</span></Tooltip>) },
    { title: '样本异常状态', dataIndex: 'abnormal', key: 'abnormal', width: 120, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-20">{t}</span></Tooltip>) },
    { title: '存储位置', dataIndex: 'storageLocation', key: 'storageLocation', width: 160, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
    { title: '存储盒ID', dataIndex: 'storageBoxId', key: 'storageBoxId', width: 160, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
    { title: '接收人', dataIndex: 'receiver', key: 'receiver', width: 120, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-20">{t}</span></Tooltip>) },
  ];

  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);

  return (
    <Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filtered} scroll={{ x: totalWidth }} pagination={false} />
  );
};

export default SamplesTable;
