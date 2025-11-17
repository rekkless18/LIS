import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useLogisticsStore } from '@/stores/logistics';

interface Props { onRowSelect: (keys: React.Key[]) => void; }

const LogisticsTable: React.FC<Props> = ({ onRowSelect }) => {
  const { filtered, selectedRowKeys, setSelectedRowKeys } = useLogisticsStore();

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => { setSelectedRowKeys(keys as string[]); onRowSelect(keys); }
  };

  const columns: ColumnsType<any> = [
    { title: '', dataIndex: 'id', key: 'id', width: 48, fixed: 'left', render: () => null },
    { title: '物流单号', dataIndex: 'waybillNo', key: 'waybillNo', width: 160, fixed: 'left', render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
    { title: '订单编号', dataIndex: 'orderNo', key: 'orderNo', width: 160, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-40">{t}</span></Tooltip>) },
    { title: '物流公司', dataIndex: 'company', key: 'company', width: 120, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-20">{t}</span></Tooltip>) },
    { title: '物流状态', dataIndex: 'status', key: 'status', width: 120, render: (t: string) => { const map: any = { pending: '待发货', in_transit: '运输中', delivered: '已签收', exception: '异常' }; const s = map[t] || t; return (<Tooltip title={s}><span className="truncate block max-w-20">{s}</span></Tooltip>); } },
    { title: '发货时间', dataIndex: 'shippedAt', key: 'shippedAt', width: 160, render: (t: string) => { const d = new Date(t); const s = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`; return (<Tooltip title={s}><span className="truncate block max-w-40">{s}</span></Tooltip>); } },
    { title: '填写人', dataIndex: 'author', key: 'author', width: 120, render: (t: string) => (<Tooltip title={t}><span className="truncate block max-w-20">{t}</span></Tooltip>) },
  ];

  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);

  return (
    <Table rowKey="id" rowSelection={rowSelection} columns={columns} dataSource={filtered} scroll={{ x: totalWidth }} pagination={false} />
  );
};

export default LogisticsTable;
