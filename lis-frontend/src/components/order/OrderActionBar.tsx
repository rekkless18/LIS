import React, { useState } from 'react';
import { Button, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, ClockCircleOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/stores/order';
import { UrgentReasonModal } from '../modals/UrgentReasonModal';
import { useAuthStore } from '@/stores/auth';
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

  const handleUrgentConfirm = async (reason: string, type: string, requestCode: string) => {
    try {
      const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
      const userId = useAuthStore.getState().user?.id || ''
      const selected = filteredOrders.filter(o => selectedRowKeys.includes(o.id))
      const orderNos = selected.map(o => o.orderNo)
      const sampleNos = selected.flatMap(o => o.sampleNos || [])
      const productNames = selected.flatMap(o => (o.items || []).map(it => it.product?.name).filter(Boolean))
      const resp = await fetch(`${API_BASE}/approval/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow_type: 'urgent',
          applicant_id: userId,
          urgent_type: type,
          reason,
          order_nos: orderNos,
          sample_nos: sampleNos,
          product_names: productNames,
          request_code: requestCode
        })
      })
      const json = await resp.json()
      if (!resp.ok || !json?.success) throw new Error(json?.error || '加急审批提交失败')
      setUrgentModalVisible(false)
      message.success(`加急审批提交成功：${requestCode}`)
    } catch (e: any) {
      message.error(e?.message || '加急审批提交失败')
    }
  }

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