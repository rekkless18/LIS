import React, { useState } from 'react';
import { Button, Space, Tooltip, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useLogisticsStore } from '@/stores/logistics';
import NewLogisticsModal from '@/components/logistics/modals/NewLogisticsModal';
import EditLogisticsModal from '@/components/logistics/modals/EditLogisticsModal';

interface Props { onSearch: () => void; onReset: () => void; }

const LogisticsActionBar: React.FC<Props> = ({ onSearch, onReset }) => {
  const { selectedRowKeys, filtered, setSelectedRowKeys } = useLogisticsStore();
  const [newVisible, setNewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);

  const hasSelection = selectedRowKeys.length > 0;
  const hasSingle = selectedRowKeys.length === 1;

  const handleNew = () => setNewVisible(true);
  const handleEdit = () => {
    if (!hasSingle) { message.warning('请选择一个物流单'); return; }
    setEditVisible(true);
  };

  const handleVoid = () => {
    if (!hasSelection) { message.warning('请至少选择一个物流单'); return; }
    message.success('作废成功');
  };

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleNew}>新建</Button>
          <Tooltip title={hasSingle ? '' : '请选择一个物流单'}>
            <Button icon={<EditOutlined />} disabled={!hasSingle} onClick={handleEdit}>编辑</Button>
          </Tooltip>
          <Tooltip title={hasSelection ? '' : '请至少选择一个物流单'}>
            <Button icon={<DeleteOutlined />} disabled={!hasSelection} onClick={handleVoid}>作废</Button>
          </Tooltip>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onReset}>重置</Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>查询</Button>
        </Space>
      </div>
      <NewLogisticsModal visible={newVisible} onClose={() => setNewVisible(false)} onSuccess={onSearch} />
      <EditLogisticsModal visible={editVisible} onClose={() => setEditVisible(false)} onSuccess={onSearch} />
    </div>
  );
};

export default LogisticsActionBar;

