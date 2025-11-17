import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Customer {
  id: string;
  name: string;
  code: string;
  country: string;
  province: string;
  region: string;
  contractNo: string;
}

interface CustomerSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (customerIds: string[]) => void;
  selectedCustomers: string[];
  multiple?: boolean;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: '北京协和医院',
    code: 'PUMCH001',
    country: '中国',
    province: '北京',
    region: '东城区',
    contractNo: 'CON2024001'
  },
  {
    id: '2',
    name: '上海瑞金医院',
    code: 'RJH001',
    country: '中国',
    province: '上海',
    region: '黄浦区',
    contractNo: 'CON2024002'
  },
  {
    id: '3',
    name: '广州中山医院',
    code: 'ZSH001',
    country: '中国',
    province: '广东',
    region: '越秀区',
    contractNo: 'CON2024003'
  },
  {
    id: '4',
    name: '深圳人民医院',
    code: 'SZRM001',
    country: '中国',
    province: '广东',
    region: '罗湖区',
    contractNo: 'CON2024004'
  },
  {
    id: '5',
    name: '武汉同济医院',
    code: 'TJ001',
    country: '中国',
    province: '湖北',
    region: '硚口区',
    contractNo: 'CON2024005'
  }
];

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  visible,
  onCancel,
  onSelect,
  selectedCustomers,
  multiple = false
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(mockCustomers);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(selectedCustomers);

  useEffect(() => {
    setSelectedRowKeys(selectedCustomers);
  }, [selectedCustomers]);

  useEffect(() => {
    if (searchText) {
      const filtered = mockCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.code.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.country.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.province.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.region.toLowerCase().includes(searchText.toLowerCase()) ||
        customer.contractNo.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(mockCustomers);
    }
  }, [searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleOk = () => {
    onSelect(selectedRowKeys as string[]);
    onCancel();
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    type: multiple ? ('checkbox' as const) : ('radio' as const)
  };

  const columns: ColumnsType<Customer> = [
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '客户编码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '国家',
      dataIndex: 'country',
      key: 'country',
      width: 100
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
      width: 100
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 120
    },
    {
      title: '合同号',
      dataIndex: 'contractNo',
      key: 'contractNo',
      width: 120
    }
  ];

  return (
    <Modal
      title="选择客户"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      okText="确定"
      cancelText="取消"
    >
      <div className="mb-4">
        <Input
          placeholder="请输入客户名称、编码、国家、省份、地区或合同号进行搜索"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />
      </div>
      <Table
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredCustomers}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `共 ${total} 条`
        }}
        scroll={{ y: 400 }}
      />
    </Modal>
  );
};
