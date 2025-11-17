import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Space, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Product {
  id: string;
  name: string;
  code: string;
  type: string;
}

interface ProductSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (productIds: string[]) => void;
  selectedProducts: string[];
  multiple?: boolean;
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: '全基因组测序',
    code: 'WGS001',
    type: '测序类'
  },
  {
    id: '2',
    name: '外显子组测序',
    code: 'WES001',
    type: '测序类'
  },
  {
    id: '3',
    name: '肿瘤基因检测',
    code: 'TUMOR001',
    type: '肿瘤类'
  },
  {
    id: '4',
    name: '遗传病基因检测',
    code: 'GENE001',
    type: '遗传类'
  },
  {
    id: '5',
    name: '药物基因组学检测',
    code: 'PHARMA001',
    type: '药物类'
  },
  {
    id: '6',
    name: '新生儿筛查',
    code: 'NEWBORN001',
    type: '筛查类'
  },
  {
    id: '7',
    name: '产前筛查',
    code: 'PRENATAL001',
    type: '筛查类'
  },
  {
    id: '8',
    name: '肿瘤早筛',
    code: 'EARLY001',
    type: '筛查类'
  }
];

export const ProductSelectModal: React.FC<ProductSelectModalProps> = ({
  visible,
  onCancel,
  onSelect,
  selectedProducts,
  multiple = false
}) => {
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(selectedProducts);

  useEffect(() => {
    setSelectedRowKeys(selectedProducts);
  }, [selectedProducts]);

  useEffect(() => {
    if (searchText) {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.code.toLowerCase().includes(searchText.toLowerCase()) ||
        product.type.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(mockProducts);
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

  const columns: ColumnsType<Product> = [
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
      width: 250
    },
    {
      title: '产品编码',
      dataIndex: 'code',
      key: 'code',
      width: 120
    },
    {
      title: '产品类型',
      dataIndex: 'type',
      key: 'type',
      width: 120
    }
  ];

  return (
    <Modal
      title="选择产品"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={600}
      okText="确定"
      cancelText="取消"
    >
      <div className="mb-4">
        <Input
          placeholder="请输入产品名称、编码或类型进行搜索"
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
        dataSource={filteredProducts}
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
