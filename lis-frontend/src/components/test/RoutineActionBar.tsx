import React from 'react';
import { Space, Button } from 'antd';
import { useRoutineStore } from '@/stores/routine';
interface RoutineActionBarProps { onQuery: () => void; onReset: () => void; }
export const RoutineActionBar: React.FC<RoutineActionBarProps> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, approve, retest, cancel } = useRoutineStore();
  const handleApprove = () => { if (selectedRowKeys.length) approve(selectedRowKeys as string[]); };
  const handleRetest = () => { if (selectedRowKeys.length) retest(selectedRowKeys as string[]); };
  const handleCancel = () => { if (selectedRowKeys.length) cancel(selectedRowKeys as string[]); };
  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleApprove} disabled={!selectedRowKeys.length}>审核</Button>
        <Button danger onClick={handleRetest} disabled={!selectedRowKeys.length}>重测</Button>
        <Button onClick={handleCancel} disabled={!selectedRowKeys.length}>取消任务</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
    </div>
  );
};
