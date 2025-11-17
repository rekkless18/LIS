import React from 'react';
import { Space, Button } from 'antd';
import { useSpecialSequencingStore } from '@/stores/specialSequencing';
interface Props { onQuery: () => void; onReset: () => void; }
export const SpecialSequencingActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, start, pause, finish } = useSpecialSequencingStore();
  const handleStart = () => { if (selectedRowKeys.length) start(selectedRowKeys as string[]); };
  const handlePause = () => { if (selectedRowKeys.length) pause(selectedRowKeys as string[]); };
  const handleFinish = () => { if (selectedRowKeys.length) finish(selectedRowKeys as string[]); };
  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleStart} disabled={!selectedRowKeys.length}>上机</Button>
        <Button onClick={handlePause} disabled={!selectedRowKeys.length}>暂停</Button>
        <Button onClick={handleFinish} disabled={!selectedRowKeys.length}>结束</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
    </div>
  );
};