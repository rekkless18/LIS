import React, { useMemo } from 'react';
import { Space, Button } from 'antd';
import { useMsExperimentStore } from '@/stores/msExperiment';

interface Props { onQuery: () => void; onReset: () => void; }

export const MsExperimentActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, audit, rerun, cancel, filteredTasks } = useMsExperimentStore();
  const canAudit = useMemo(() => {
    if (!selectedRowKeys.length) return false;
    const selected = filteredTasks.filter(t => (selectedRowKeys as string[]).includes(t.id));
    return selected.every(t => t.status === '已完成' || t.status === '待审核');
  }, [selectedRowKeys, filteredTasks]);
  const handleAudit = () => { if (selectedRowKeys.length && canAudit) audit(selectedRowKeys as string[]); };
  const handleRerun = () => { if (selectedRowKeys.length) rerun(selectedRowKeys as string[]); };
  const handleCancel = () => { if (selectedRowKeys.length) cancel(selectedRowKeys as string[]); };

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleAudit} disabled={!canAudit}>审核</Button>
        <Button onClick={handleRerun} disabled={!selectedRowKeys.length}>重测</Button>
        <Button danger onClick={handleCancel} disabled={!selectedRowKeys.length}>取消任务</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
    </div>
  );
};

