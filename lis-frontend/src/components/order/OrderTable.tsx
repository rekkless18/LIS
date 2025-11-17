import React from 'react';
import { Table, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useOrderStore, maskName, maskPhone } from '@/stores/order';
import type { ColumnsType } from 'antd/es/table';

interface OrderTableProps {
  onRowSelect: (selectedRowKeys: React.Key[]) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({ onRowSelect }) => {
  const navigate = useNavigate();
  const { filteredOrders, selectedRowKeys, setSelectedRowKeys } = useOrderStore();

  const handleRowClick = (record: any) => {
    if (record.type === 'product') {
      navigate(`/order/product/${record.id}`);
    } else {
      navigate(`/order/package/${record.id}`);
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys as string[]);
      onRowSelect(newSelectedRowKeys);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: '',
      dataIndex: 'id',
      key: 'id',
      width: 48,
      fixed: 'left',
      render: (_, record) => null // Handled by rowSelection
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 160,
      fixed: 'left',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="cursor-pointer text-blue-600 hover:text-blue-800 truncate block max-w-40">
            {text}
          </span>
        </Tooltip>
      )
    },
    {
      title: '客户名称',
      dataIndex: ['customer', 'name'],
      key: 'customerName',
      width: 160,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate block max-w-40">{text}</span>
        </Tooltip>
      )
    },
    {
      title: '样本编号',
      dataIndex: 'sampleNos',
      key: 'sampleNos',
      width: 160,
      render: (sampleNos: string[]) => {
        const text = sampleNos.join(', ');
        return (
          <Tooltip title={text}>
            <span className="truncate block max-w-40">{text}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '产品名称',
      dataIndex: 'items',
      key: 'productNames',
      width: 160,
      render: (items: any[]) => {
        const text = items.map(item => item.product.name).join(', ');
        return (
          <Tooltip title={text}>
            <span className="truncate block max-w-40">{text}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '套餐名称',
      dataIndex: ['package', 'name'],
      key: 'packageName',
      width: 160,
      render: (text: string, record: any) => {
        const packageName = record.type === 'package' ? text : '';
        return (
          <Tooltip title={packageName}>
            <span className="truncate block max-w-40">{packageName}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const statusMap = {
          processing: '交付中',
          partially_completed: '部分完成',
          completed: '全部完成',
          cancelled: '已取消',
          exception: '异常'
        };
        return (
          <Tooltip title={statusMap[status as keyof typeof statusMap]}>
            <span className="truncate block max-w-20">{statusMap[status as keyof typeof statusMap]}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '订单创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (text: string) => {
        const date = new Date(text);
        const formatted = date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        return (
          <Tooltip title={formatted}>
            <span className="truncate block max-w-40">{formatted}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '患者姓名',
      dataIndex: ['patient', 'name'],
      key: 'patientName',
      width: 120,
      render: (text: string) => {
        const masked = maskName(text);
        return (
          <Tooltip title={text}>
            <span className="truncate block max-w-20">{masked}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '患者手机号',
      dataIndex: ['patient', 'phone'],
      key: 'patientPhone',
      width: 120,
      render: (text: string) => {
        const masked = maskPhone(text);
        return (
          <Tooltip title={text}>
            <span className="truncate block max-w-20">{masked}</span>
          </Tooltip>
        );
      }
    },
    {
      title: '患者ID',
      dataIndex: ['patient', 'id'],
      key: 'patientId',
      width: 120,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate block max-w-20">{text}</span>
        </Tooltip>
      )
    },
    {
      title: '录入人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="truncate block max-w-20">{text}</span>
        </Tooltip>
      )
    }
  ];

  const totalWidth = columns.reduce((sum, col) => sum + (typeof col.width === 'number' ? col.width : 120), 0);

  return (
    <Table
      rowKey="id"
      rowSelection={rowSelection}
      columns={columns}
      dataSource={filteredOrders}
      scroll={{ x: totalWidth }}
      pagination={false}
      onRow={(record) => ({
        onClick: () => handleRowClick(record)
      })}
      className="cursor-pointer"
    />
  );
};
