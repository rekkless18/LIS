import React, { useState } from 'react';
import { Button, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, ClockCircleOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/stores/order';
import { UrgentReasonModal } from '../modals/UrgentReasonModal';
import { VoidConfirmModal } from '../modals/VoidConfirmModal';
import { OrderTypeSelectModal } from '../modals/OrderTypeSelectModal';

interface OrderActionBarProps {
  onSearch: () => void;
  onReset: () => void;
}

export const OrderActionBar: React.FC<OrderActionBarProps> = ({ onSearch, onReset }) => {
  const navigate = useNavigate();
  const { selectedRowKeys, filteredOrders, voidOrders, markUrgent } = useOrderStore();
  const [urgentModalVisible, setUrgentModalVisible] = useState(false);
  const [voidModalVisible, setVoidModalVisible] = useState(false);
  const [orderTypeModalVisible, setOrderTypeModalVisible] = useState(false);

  const selectedCount = selectedRowKeys.length;
  const hasSelection = selectedCount > 0;
  const hasSingleSelection = selectedCount === 1;

  const handleNewOrder = () => {
    setOrderTypeModalVisible(true);
  };

  const handleEditOrder = () => {
    if (!hasSingleSelection) {
      message.warning('请选择一个订单');
      return;
    }
    
    const selectedOrder = filteredOrders.find(order => order.id === selectedRowKeys[0]);
    if (selectedOrder) {
      if (selectedOrder.type === 'product') {
        navigate(`/order/product/${selectedOrder.id}/edit`);
      } else {
        navigate(`/order/package/${selectedOrder.id}/edit`);
      }
    }
  };

  const handleUrgentOrder = () => {
    if (!hasSelection) {
      message.warning('请至少选择一个订单');
      return;
    }
    setUrgentModalVisible(true);
  };

  const handleVoidOrder = () => {
    if (!hasSelection) {
      message.warning('请至少选择一个订单');
      return;
    }
    setVoidModalVisible(true);
  };

  const handleUrgentConfirm = (reason: string, type: string) => {
    markUrgent(selectedRowKeys, reason, type);
    setUrgentModalVisible(false);
    message.success('订单加急成功');
    onSearch();
  };

  const handleVoidConfirm = () => {
    voidOrders(selectedRowKeys);
    setVoidModalVisible(false);
    message.success('订单作废成功');
    onSearch();
  };

  const handleOrderTypeSelect = (type: 'product' | 'package') => {
    setOrderTypeModalVisible(false);
    if (type === 'product') {
      navigate('/order/product/new');
    } else {
      navigate('/order/package/new');
    }
  };

  return (
    <>
      <div className="bg-white p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleNewOrder}
            >
              新建
            </Button>
            <Tooltip title={hasSingleSelection ? '' : '请选择一个订单'}>
              <Button
                icon={<EditOutlined />}
                disabled={!hasSingleSelection}
                onClick={handleEditOrder}
              >
                编辑
              </Button>
            </Tooltip>
            <Tooltip title={hasSelection ? '' : '请至少选择一个订单'}>
              <Button
                icon={<ClockCircleOutlined />}
                disabled={!hasSelection}
                onClick={handleUrgentOrder}
              >
                加急
              </Button>
            </Tooltip>
            <Tooltip title={hasSelection ? '' : '请至少选择一个订单'}>
              <Button
                icon={<DeleteOutlined />}
                disabled={!hasSelection}
                onClick={handleVoidOrder}
              >
                作废
              </Button>
            </Tooltip>
          </Space>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              重置
            </Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
              查询
            </Button>
          </Space>
        </div>
      </div>

      <UrgentReasonModal
        visible={urgentModalVisible}
        onCancel={() => setUrgentModalVisible(false)}
        onConfirm={handleUrgentConfirm}
      />

      <VoidConfirmModal
        visible={voidModalVisible}
        onCancel={() => setVoidModalVisible(false)}
        onConfirm={handleVoidConfirm}
      />

      <OrderTypeSelectModal
        visible={orderTypeModalVisible}
        onCancel={() => setOrderTypeModalVisible(false)}
        onSelect={handleOrderTypeSelect}
      />
    </>
  );
};