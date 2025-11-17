import React from 'react';
import { Modal, Button, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface VoidConfirmModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const VoidConfirmModal: React.FC<VoidConfirmModalProps> = ({
  visible,
  onCancel,
  onConfirm
}) => {
  const handleOk = () => {
    onConfirm();
  };

  return (
    <Modal
      title="作废确认"
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText="确定"
      cancelText="取消"
      okButtonProps={{ danger: true }}
    >
      <div className="flex items-center">
        <ExclamationCircleOutlined className="text-red-500 text-xl mr-3" />
        <span>确定要作废选中的订单么？操作后不可恢复</span>
      </div>
    </Modal>
  );
};
