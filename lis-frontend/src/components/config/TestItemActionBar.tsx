import React, { useState } from 'react';
import { Space, Button, Modal, Form, Input, Select, message } from 'antd';
import { useTestItemConfigStore, TestItemType, JudgeType, EnableStatus } from '@/stores/configTestItem';

const { Option } = Select;

interface Props { onQuery: () => void; onReset: () => void }

export const TestItemActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, createItem, editItem, deleteItems, enableItems, disableItems, filteredItems } = useTestItemConfigStore();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [form] = Form.useForm();
  const [childOptions, setChildOptions] = useState<{id: string, item_code: string, item_name: string}[]>([]);

  /**
   * 功能描述：加载启用的检测项作为聚合子项选项
   * 参数说明：excludeId 可选，编辑时排除当前父项ID
   * 返回值类型及用途：无（内部设置 childOptions 状态）
   */
  const loadEnabledTestItems = async (excludeId?: string) => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
    const url = excludeId ? `${API_BASE}/test-items/enabled?excludeId=${excludeId}` : `${API_BASE}/test-items/enabled`;
    const resp = await fetch(url);
    const json = await resp.json();
    setChildOptions(json.data || []);
  };

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true); };
  const handleCreateSubmit = () => {
    form.validateFields().then(values => {
      const jt = values.judgeTypes as string;
      // 聚合类型校验：至少选中一个子检测项且不可重复
      if (jt === '聚合') {
        const rows = (values.aggregateItems || []) as any[];
        const valid = rows.filter(r => r && r.childId);
        if (!valid.length) { message.warning('请至少选择一个子检测项'); return; }
        const ids = valid.map(r => r.childId);
        const setIds = new Set(ids);
        if (setIds.size !== ids.length) { message.warning('子检测项不可重复'); return; }
      }
      createItem({
        itemCode: values.itemCode,
        itemName: values.itemName,
        itemTypes: [values.itemTypes as TestItemType],
        judgeTypes: [values.judgeTypes as JudgeType],
        status: values.status as EnableStatus,
        limitUpper: jt === '上限' || jt === '上下限' ? (values.limitUpper ?? null) : null,
        limitLower: jt === '下限' || jt === '上下限' ? (values.limitLower ?? null) : null,
        unit: ['上限','下限','上下限'].includes(jt) ? (values.unit ?? null) : null,
        qualitativeValue: ['定性','阴阳性'].includes(jt) ? (values.qualitativeValue ?? null) : null,
        aggregateCondition: values.aggregateCondition,
        aggregateItems: (values.aggregateItems || []).map((r: any) => ({ childId: r.childId, result: r.result })),
      });
      setOpenCreate(false);
      message.success('新建检测项成功');
    });
  };

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个检测项'); return; }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0]);
    if (!target) { message.warning('未找到选中检测项'); return; }
    form.setFieldsValue({
      itemCode: target.itemCode,
      itemName: target.itemName,
      itemTypes: target.itemTypes?.[0],
      judgeTypes: target.judgeTypes?.[0],
      status: target.status,
      limitUpper: target.limitUpper ?? null,
      limitLower: target.limitLower ?? null,
      unit: target.unit ?? null,
      qualitativeValue: target.qualitativeValue ?? null,
      aggregateCondition: target.aggregateCondition,
      aggregateItems: (target.aggregateItems || []).map((it) => ({ childId: it.childId, result: it.result })),
    });
    loadEnabledTestItems(target.id);
    setOpenEdit(true);
  };
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string;
    form.validateFields().then(values => {
      const jt = values.judgeTypes as string;
      if (jt === '聚合') {
        const rows = (values.aggregateItems || []) as any[];
        const valid = rows.filter(r => r && r.childId);
        if (!valid.length) { message.warning('请至少选择一个子检测项'); return; }
        const ids = valid.map(r => r.childId);
        const setIds = new Set(ids);
        if (setIds.size !== ids.length) { message.warning('子检测项不可重复'); return; }
      }
      editItem(id, {
        itemCode: values.itemCode,
        itemName: values.itemName,
        itemTypes: [values.itemTypes as TestItemType],
        judgeTypes: [values.judgeTypes as JudgeType],
        status: values.status as EnableStatus,
        limitUpper: jt === '上限' || jt === '上下限' ? (values.limitUpper ?? null) : null,
        limitLower: jt === '下限' || jt === '上下限' ? (values.limitLower ?? null) : null,
        unit: ['上限','下限','上下限'].includes(jt) ? (values.unit ?? null) : null,
        qualitativeValue: ['定性','阴阳性'].includes(jt) ? (values.qualitativeValue ?? null) : null,
        aggregateCondition: values.aggregateCondition,
        aggregateItems: (values.aggregateItems || []).map((r: any) => ({ childId: r.childId, result: r.result })),
      });
      setOpenEdit(false);
      message.success('编辑检测项成功');
    });
  };

  const handleDelete = () => { if (selectedRowKeys.length) deleteItems(selectedRowKeys as string[]); };
  const handleEnable = () => { if (selectedRowKeys.length) enableItems(selectedRowKeys as string[]); };
  const handleDisable = () => { if (selectedRowKeys.length) disableItems(selectedRowKeys as string[]); };

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOpenCreate}>新建</Button>
        <Button onClick={handleOpenEdit} disabled={!selectedRowKeys.length}>编辑</Button>
        <Button danger onClick={handleDelete} disabled={!selectedRowKeys.length}>删除</Button>
        <Button onClick={handleEnable} disabled={!selectedRowKeys.length}>启用</Button>
        <Button onClick={handleDisable} disabled={!selectedRowKeys.length}>禁用</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="新建检测项" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭" afterOpenChange={(opened) => { if (opened) loadEnabledTestItems(); }}>
        <Form form={form} layout="vertical" onValuesChange={(changed, all) => {
          if (changed.judgeTypes) {
            const jt = changed.judgeTypes as string;
            if (jt === '聚合') {
              if (!all.aggregateItems || !all.aggregateItems.length) form.setFieldsValue({ aggregateItems: [{}] });
              form.setFieldsValue({ limitUpper: null, limitLower: null, unit: null, qualitativeValue: null });
            } else if (['上限','下限','上下限'].includes(jt)) {
              form.setFieldsValue({ qualitativeValue: null, aggregateItems: [] });
            } else if (['定性','阴阳性'].includes(jt)) {
              form.setFieldsValue({ limitUpper: null, limitLower: null, unit: null, aggregateItems: [] });
            }
          }
        }}>
          <Form.Item label="检测项编码" name="itemCode" rules={[{ required: true, message: '请输入检测项编码' }]}><Input /></Form.Item>
          <Form.Item label="检测项名称" name="itemName" rules={[{ required: true, message: '请输入检测项名称' }]}><Input /></Form.Item>
          <Form.Item label="检测项类型" name="itemTypes" rules={[{ required: true, message: '请选择检测项类型' }]}><Select placeholder="请选择">{(['普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项'] as TestItemType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="结果判断类型" name="judgeTypes" rules={[{ required: true, message: '请选择结果判断类型' }]}><Select placeholder="请选择">{(['上限','下限','上下限','定性','阴阳性','聚合'] as JudgeType[]).map(j => (<Option key={j} value={j}>{j}</Option>))}</Select></Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => (
              ['上限','上下限'].includes(getFieldValue('judgeTypes')) ? (
                <Form.Item label="上限值" name="limitUpper"><Input type="number" placeholder="请输入上限值" /></Form.Item>
              ) : null
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => (
              ['下限','上下限'].includes(getFieldValue('judgeTypes')) ? (
                <Form.Item label="下限值" name="limitLower"><Input type="number" placeholder="请输入下限值" /></Form.Item>
              ) : null
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => (
              ['上限','下限','上下限'].includes(getFieldValue('judgeTypes')) ? (
                <Form.Item label="单位" name="unit"><Input placeholder="请输入单位" /></Form.Item>
              ) : null
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => (
              ['定性','阴阳性'].includes(getFieldValue('judgeTypes')) ? (
                <Form.Item label="结果值" name="qualitativeValue" rules={[{ required: true, message: '请输入结果值' }]}><Input placeholder="请输入结果值" /></Form.Item>
              ) : null
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => getFieldValue('judgeTypes') === '聚合' ? (
            <>
              <Form.Item label="判断条件" name="aggregateCondition" rules={[{ required: true, message: '请选择判断条件' }]}>
                <Select placeholder="请选择">{(['任意满足','所有满足','任意不满足','所有不满足'] as string[]).map(c => (<Option key={c} value={c}>{c}</Option>))}</Select>
              </Form.Item>
              <Form.List name="aggregateItems">
                {(fields, { add, remove }) => (
                  <div>
                    {fields.map(field => (
                      <div key={field.key} className="flex items-center gap-2 py-1">
                        <Form.Item fieldKey={field.fieldKey} name={[field.name, 'childId']} rules={[{ required: true, message: '请选择检测项' }]} className="flex-1" label={field.name === 0 ? '子检测项' : ''}>
                          <Select placeholder="请选择">
                            {childOptions.map(opt => (<Option key={opt.id} value={opt.id}>{opt.item_name}</Option>))}
                          </Select>
                        </Form.Item>
                        <Form.Item fieldKey={field.fieldKey} name={[field.name, 'result']} rules={[{ required: true, message: '请选择判断结果' }]} className="flex-1" label={field.name === 0 ? '判断结果' : ''}>
                          <Select placeholder="请选择">{(['偏高','偏低','正常','异常'] as string[]).map(r => (<Option key={r} value={r}>{r}</Option>))}</Select>
                        </Form.Item>
                        <Button onClick={() => remove(field.name)} danger>删除</Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()}>
                      新增子检测项
                    </Button>
                  </div>
                )}
              </Form.List>
            </>
            ) : null}
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑检测项" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical" onValuesChange={(changed, all) => {
          if (changed.judgeTypes) {
            const jt = changed.judgeTypes as string;
            if (jt === '聚合') {
              if (!all.aggregateItems || !all.aggregateItems.length) form.setFieldsValue({ aggregateItems: [{}] });
              form.setFieldsValue({ limitUpper: null, limitLower: null, unit: null, qualitativeValue: null });
            } else if (['上限','下限','上下限'].includes(jt)) {
              form.setFieldsValue({ qualitativeValue: null, aggregateItems: [] });
            } else if (['定性','阴阳性'].includes(jt)) {
              form.setFieldsValue({ limitUpper: null, limitLower: null, unit: null, aggregateItems: [] });
            }
          }
        }}>
          <Form.Item label="检测项编码" name="itemCode" rules={[{ required: true, message: '请输入检测项编码' }]}><Input /></Form.Item>
          <Form.Item label="检测项名称" name="itemName" rules={[{ required: true, message: '请输入检测项名称' }]}><Input /></Form.Item>
          <Form.Item label="检测项类型" name="itemTypes" rules={[{ required: true, message: '请选择检测项类型' }]}><Select placeholder="请选择">{(['普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项'] as TestItemType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="结果判断类型" name="judgeTypes" rules={[{ required: true, message: '请选择结果判断类型' }]}><Select placeholder="请选择">{(['上限','下限','上下限','定性','阴阳性','聚合'] as JudgeType[]).map(j => (<Option key={j} value={j}>{j}</Option>))}</Select></Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => (
              ['上限','上下限'].includes(getFieldValue('judgeTypes')) ? (
                <Form.Item label="上限值" name="limitUpper"><Input type="number" placeholder="请输入上限值" /></Form.Item>
              ) : null
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => (
              ['下限','上下限'].includes(getFieldValue('judgeTypes')) ? (
                <Form.Item label="下限值" name="limitLower"><Input type="number" placeholder="请输入下限值" /></Form.Item>
              ) : null
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => (
              ['上限','下限','上下限'].includes(getFieldValue('judgeTypes')) ? (
                <Form.Item label="单位" name="unit"><Input placeholder="请输入单位" /></Form.Item>
              ) : null
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => (
              ['定性','阴阳性'].includes(getFieldValue('judgeTypes')) ? (
                <Form.Item label="结果值" name="qualitativeValue" rules={[{ required: true, message: '请输入结果值' }]}><Input placeholder="请输入结果值" /></Form.Item>
              ) : null
            )}
          </Form.Item>
          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.judgeTypes !== cur.judgeTypes}>
            {({ getFieldValue }) => getFieldValue('judgeTypes') === '聚合' ? (
            <>
              <Form.Item label="判断条件" name="aggregateCondition" rules={[{ required: true, message: '请选择判断条件' }]}>
                <Select placeholder="请选择">{(['任意满足','所有满足','任意不满足','所有不满足'] as string[]).map(c => (<Option key={c} value={c}>{c}</Option>))}</Select>
              </Form.Item>
              <Form.List name="aggregateItems">
                {(fields, { add, remove }) => (
                  <div>
                    {fields.map(field => (
                      <div key={field.key} className="flex items-center gap-2 py-1">
                        <Form.Item fieldKey={field.fieldKey} name={[field.name, 'childId']} rules={[{ required: true, message: '请选择检测项' }]} className="flex-1" label={field.name === 0 ? '子检测项' : ''}>
                          <Select placeholder="请选择">
                            {childOptions.map(opt => (<Option key={opt.id} value={opt.id}>{opt.item_name}</Option>))}
                          </Select>
                        </Form.Item>
                        <Form.Item fieldKey={field.fieldKey} name={[field.name, 'result']} rules={[{ required: true, message: '请选择判断结果' }]} className="flex-1" label={field.name === 0 ? '判断结果' : ''}>
                          <Select placeholder="请选择">{(['偏高','偏低','正常','异常'] as string[]).map(r => (<Option key={r} value={r}>{r}</Option>))}</Select>
                        </Form.Item>
                        <Button onClick={() => remove(field.name)} danger>删除</Button>
                      </div>
                    ))}
                    <Button type="dashed" onClick={() => add()}>
                      新增子检测项
                    </Button>
                  </div>
                )}
              </Form.List>
            </>
            ) : null}
          </Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

