import React from 'react';
import { Space, Button } from 'antd';
import { useSpecialBioinfoStore } from '@/stores/specialBioinfo';
interface Props { onQuery: () => void; onReset: () => void; }
export const SpecialBioinfoActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, start, rerun, audit } = useSpecialBioinfoStore();
  const handleStart = () => { if (selectedRowKeys.length) start(selectedRowKeys as string[]); };
  const handleRerun = () => { if (selectedRowKeys.length) rerun(selectedRowKeys as string[]); };
  const handleAudit = () => { if (selectedRowKeys.length) audit(selectedRowKeys as string[]); };
  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleStart} disabled={!selectedRowKeys.length}>开始分析</Button>
        <Button onClick={handleRerun} disabled={!selectedRowKeys.length}>重跑</Button>
        <Button onClick={handleAudit} disabled={!selectedRowKeys.length}>审核</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
    </div>
  );
};