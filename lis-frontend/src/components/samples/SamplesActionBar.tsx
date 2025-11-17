import React, { useState } from 'react';
import { Button, Space, Tooltip, message } from 'antd';
import { PlusOutlined, AlertOutlined, ToolOutlined, LockOutlined, DeleteOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useSampleStore } from '@/stores/samples';

interface Props { onSearch: () => void; onReset: () => void; }

const SamplesActionBar: React.FC<Props> = ({ onSearch, onReset }) => {
  const navigate = useNavigate();
  const { selectedRowKeys } = useSampleStore();
  const hasSelection = selectedRowKeys.length > 0;

  const handleReceive = () => { navigate('/samples/receive'); };
  const tip = hasSelection ? '' : '请至少选择一个样本';

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleReceive}>样本接收</Button>
          <Tooltip title={tip}><Button icon={<AlertOutlined />} disabled={!hasSelection}>登记异常</Button></Tooltip>
          <Tooltip title={tip}><Button icon={<ToolOutlined />} disabled={!hasSelection}>异常处理</Button></Tooltip>
          <Tooltip title={tip}><Button icon={<LockOutlined />} disabled={!hasSelection}>冻存</Button></Tooltip>
          <Tooltip title={tip}><Button icon={<DeleteOutlined />} disabled={!hasSelection}>销毁</Button></Tooltip>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={onReset}>重置</Button>
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>查询</Button>
        </Space>
      </div>
    </div>
  );
};

export default SamplesActionBar;
