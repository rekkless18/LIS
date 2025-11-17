import React from 'react';
import { Space, Button } from 'antd';
import { useSpecialExceptionStore } from '@/stores/specialException';

interface Props { onQuery: () => void; onReset: () => void; }

export const SpecialExceptionActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, submit, retest, cancel } = useSpecialExceptionStore();
  const handleSubmit = () => { if (selectedRowKeys.length) submit(selectedRowKeys as string[]); };
  const handleRetest = () => { if (selectedRowKeys.length) retest(selectedRowKeys as string[]); };
  const handleCancel = () => { if (selectedRowKeys.length) cancel(selectedRowKeys as string[]); };
  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleSubmit} disabled={!selectedRowKeys.length}>提交</Button>
        <Button onClick={handleRetest} disabled={!selectedRowKeys.length}>重测</Button>
        <Button danger onClick={handleCancel} disabled={!selectedRowKeys.length}>取消任务</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
    </div>
  );
};

