import React from 'react';
import { Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMsExceptionStore } from '@/stores/msException';

export const MsExceptionRightTable: React.FC = () => {
  const { filteredItems } = useMsExceptionStore();
  const columns: ColumnsType<any> = [
    { title: '检测项名称', dataIndex: 'itemName', key: 'itemName', width: 160, fixed: 'left', render: (text: string) => (<Tooltip title={text}><span className="truncate block max-w-40">{text}</span></Tooltip>) },
    { title: '检测项结果', dataIndex: 'result', key: 'result', width: 160 },
    { title: '检测项判读结果', dataIndex: 'interpret', key: 'interpret', width: 160 },
    { title: '前3次历史检测项结果', dataIndex: 'history3', key: 'history3', width: 180 },
    { title: '前2次历史检测项结果', dataIndex: 'history2', key: 'history2', width: 180 },
    { title: '前1次历史检测项结果', dataIndex: 'history1', key: 'history1', width: 180 }
  ];
  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);
  return (<Table rowKey="id" columns={columns} dataSource={filteredItems} scroll={{ x: totalWidth }} pagination={false} />);
};

