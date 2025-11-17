import React from 'react';
import { Modal, Button, Space } from 'antd';
import { FileTextOutlined, GiftOutlined, CloseOutlined } from '@ant-design/icons';

interface OrderTypeSelectModalProps {
  visible: boolean;
  onCancel: () => void;
  onSelect: (type: 'product' | 'package') => void;
}

export const OrderTypeSelectModal: React.FC<OrderTypeSelectModalProps> = ({
  visible,
  onCancel,
  onSelect
}) => {
  const handleProductClick = () => {
    onSelect('product');
  };

  const handlePackageClick = () => {
    onSelect('package');
  };

  return (
    <Modal
      title="选择订单类型"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={400}
      closeIcon={<CloseOutlined />}
    >
      <div className="flex flex-col space-y-4">
        <Button
          type="default"
          size="large"
          icon={<FileTextOutlined />}
          className="h-20 text-left flex items-center justify-start px-6"
          onClick={handleProductClick}
        >
          <div className="flex flex-col">
            <span className="text-lg font-medium">产品订单</span>
            <span className="text-sm text-gray-500 mt-1">自由组合产品下单</span>
          </div>
        </Button>
        <Button
          type="default"
          size="large"
          icon={<GiftOutlined />}
          className="h-20 text-left flex items-center justify-start px-6"
          onClick={handlePackageClick}
        >
          <div className="flex flex-col">
            <span className="text-lg font-medium">套餐订单</span>
            <span className="text-sm text-gray-500 mt-1">按预设套餐下单</span>
          </div>
        </Button>
      </div>
    </Modal>
  );
};
