import React from 'react';
import { Space, Button } from 'antd';
import { useRoutineExceptionStore } from '@/stores/routineException';
interface Props { onQuery: () => void; onReset: () => void; }
export const RoutineExceptionActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, markException, retest, close } = useRoutineExceptionStore();
  const handleMark = () => { if (selectedRowKeys.length) markException(selectedRowKeys as string[]); };
  const handleRetest = () => { if (selectedRowKeys.length) retest(selectedRowKeys as string[]); };
  const handleClose = () => { if (selectedRowKeys.length) close(selectedRowKeys as string[]); };
  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleMark} disabled={!selectedRowKeys.length}>异常标记</Button>
        <Button danger onClick={handleRetest} disabled={!selectedRowKeys.length}>重新检测</Button>
        <Button onClick={handleClose} disabled={!selectedRowKeys.length}>异常关闭</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
    </div>
  );
};
