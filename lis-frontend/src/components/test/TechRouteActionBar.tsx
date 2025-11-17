import React, { useState } from 'react';
import { Space, Button, Modal, Input } from 'antd';
import { useTechRouteStore } from '@/stores/techRoute';
interface Props { onQuery: () => void; onReset: () => void; }
export const TechRouteActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, confirm, cancel, changeRoute } = useTechRouteStore();
  const [visible, setVisible] = useState(false);
  const [route, setRoute] = useState('');
  const handleConfirm = () => { if (selectedRowKeys.length) confirm(selectedRowKeys as string[]); };
  const handleCancel = () => { if (selectedRowKeys.length) cancel(selectedRowKeys as string[]); };
  const handleChangeRoute = () => { if (selectedRowKeys.length) setVisible(true); };
  const handleSubmitRoute = () => { changeRoute(selectedRowKeys as string[], route); setVisible(false); setRoute(''); };
  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleConfirm} disabled={!selectedRowKeys.length}>确认</Button>
        <Button onClick={handleCancel} disabled={!selectedRowKeys.length}>取消</Button>
        <Button onClick={handleChangeRoute} disabled={!selectedRowKeys.length}>更换技术路线</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>
      <Modal title="更换技术路线" open={visible} onOk={handleSubmitRoute} onCancel={() => setVisible(false)} okText="提交" cancelText="关闭">
        <Input placeholder="请输入新技术路线名称" value={route} onChange={(e) => setRoute(e.target.value)} />
      </Modal>
    </div>
  );
};
