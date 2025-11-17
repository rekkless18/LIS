import React from 'react';
import { Space, Button } from 'antd';
import { useSpecialQPCRStore } from '@/stores/specialQPCR';

interface Props { onQuery: () => void; onReset: () => void; }

export const SpecialQPCRActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, startAnalysis, rerun, audit } = useSpecialQPCRStore();
  const handleStart = () => { if (selectedRowKeys.length) startAnalysis(selectedRowKeys as string[]); };
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

