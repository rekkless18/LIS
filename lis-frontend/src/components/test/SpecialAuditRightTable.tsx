import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSpecialAuditStore } from '@/stores/specialAudit';

export const SpecialAuditRightTable: React.FC = () => {
  const { filteredItems } = useSpecialAuditStore();
  const columns: ColumnsType<any> = [
    { title: '检测项名称', dataIndex: 'itemName', key: 'itemName', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '检测项范围', dataIndex: 'itemRange', key: 'itemRange', width: 160 },
    { title: '检测项单位', dataIndex: 'unit', key: 'unit', width: 120 },
    { title: '检测项结果', dataIndex: 'result', key: 'result', width: 160 },
    { title: '检测项判读结果', dataIndex: 'interpret', key: 'interpret', width: 160 }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />);
};

