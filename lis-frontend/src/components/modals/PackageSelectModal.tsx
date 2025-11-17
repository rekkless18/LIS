import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Package {
  id: string;
  name: string;
  code: string;
  type: string;
}

interface PackageSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (packageId: string) => void;
}

const mockPackages: Package[] = [
  {
    id: '1',
    name: '基础健康检测套餐',
    code: 'BASIC001',
    type: '基础类'
  },
  {
    id: '2',
    name: '肿瘤筛查套餐',
    code: 'TUMOR001',
    type: '肿瘤类'
  },
  {
    id: '3',
    name: '遗传病检测套餐',
    code: 'GENE001',
    type: '遗传类'
  },
  {
    id: '4',
    name: '新生儿筛查套餐',
    code: 'NEWBORN001',
    type: '新生儿类'
  },
  {
    id: '5',
    name: '心血管检测套餐',
    code: 'CARDIO001',
    type: '心血管类'
  },
  {
    id: '6',
    name: '代谢病检测套餐',
    code: 'METAB001',
    type: '代谢类'
  }
];

export const PackageSelectModal: React.FC<PackageSelectModalProps> = ({
  visible,
  onCancel,
  onSelect
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredPackages, setFilteredPackages] = useState<Package[]>(mockPackages);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    if (searchText) {
      const filtered = mockPackages.filter(pkg =>
        pkg.name.toLowerCase().includes(searchText.toLowerCase()) ||
        pkg.code.toLowerCase().includes(searchText.toLowerCase()) ||
        pkg.type.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredPackages(filtered);
    } else {
      setFilteredPackages(mockPackages);
    }
  }, [searchText]);

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleOk = () => {
    if (selectedRowKeys.length === 1) {
      onSelect(selectedRowKeys[0] as string);
      onCancel();
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys.slice(-1)); // Only allow one selection
    },
    type: 'radio' as const
  };

  const columns: ColumnsType<Package> = [
    {
      title: '套餐名称',
      dataIndex: 'name',
      key: 'name',
      width: 250
    },
    {
      title: '套餐编码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '套餐类型',
      dataIndex: 'type',
      key: 'type',
      width: 120
    }
  ];

  return (
    <Modal
      title="选择套餐"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={600}
      okText="确定"
      cancelText="取消"
    >
      <div className="mb-4">
        <Input
          placeholder="请输入套餐名称、编码或类型进行搜索"
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
        dataSource={filteredPackages}
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
