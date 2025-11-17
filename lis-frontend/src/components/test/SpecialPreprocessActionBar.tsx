import React from 'react';
import { Space, Button } from 'antd';
import { useSpecialPreprocessStore } from '@/stores/specialPreprocess';
interface Props { onQuery: () => void; onReset: () => void; }
export const SpecialPreprocessActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, order, start, cancel } = useSpecialPreprocessStore();
  const handleOrder = () => { if (selectedRowKeys.length) order(selectedRowKeys as string[]); };
  const handleStart = () => { if (selectedRowKeys.length) start(selectedRowKeys as string[]); };
  const handleCancel = () => { if (selectedRowKeys.length) cancel(selectedRowKeys as string[]); };
  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOrder} disabled={!selectedRowKeys.length}>下单</Button>
        <Button type="primary" onClick={handleStart} disabled={!selectedRowKeys.length}>开始</Button>
        <Button danger onClick={handleCancel} disabled={!selectedRowKeys.length}>取消任务</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
    </div>
  );
};