import React, { useState } from 'react'
import { Space, Button, Modal, Form, Input, Select, Row, Col, message } from 'antd'
import { useApprovalConfigStore, FlowType, FlowLevel, EnableStatus, ApproverType, FlowNode } from '@/stores/approvalConfig'
import { useRoleConfigStore } from '@/stores/permissionRole'
import { useUserConfigStore } from '@/stores/permissionUser'

const { Option } = Select

interface Props { onQuery: () => void; onReset: () => void }

export const ApprovalFlowActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, filteredItems, createFlow, editFlow, deleteFlows, enableFlows, disableFlows } = useApprovalConfigStore()
  const roleItems = useRoleConfigStore(s => s.items)
  const roleQuery = useRoleConfigStore(s => s.query)
  const userItems = useUserConfigStore(s => s.items)
  const userQuery = useUserConfigStore(s => s.query)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [formCreate] = Form.useForm()
  const [formEdit] = Form.useForm()

  const deptOptions = ['销售部','采购部','门诊部','检验科','财务部','人力部','后勤部','行政部','其他','运维部']

  const levelToCount = (lv: FlowLevel): number => (lv === '一级审批' ? 1 : lv === '二级审批' ? 2 : 3)

  const renderNodes = (nodes: FlowNode[]) => (
    <Row gutter={24}>
      {nodes.map((n, idx) => (
        <Col xs={24} key={idx}>
          <Row gutter={24}>
            <Col xs={24} sm={12} md={12}>
              <Form.Item name={["nodes", idx, "approverType"]} label={`审批节点${idx + 1}审批人类型`} rules={[{ required: true, message: '请选择审批人类型' }]}>
                <Select placeholder="请选择">
                  {(['系统角色','部门负责人','指定用户','直接上级','间接上级'] as ApproverType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={12}>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.nodes !== cur.nodes}>
                {({ getFieldValue }) => {
                  const type: ApproverType = getFieldValue(["nodes", idx, "approverType"]) as ApproverType
                  if (type === '系统角色') {
                    return (
                      <Form.Item name={["nodes", idx, "roleName"]} label="系统角色" rules={[{ required: true, message: '请选择系统角色' }]}>
                        <Select placeholder="请选择角色" options={roleItems.map(r => ({ label: r.roleName, value: r.roleName }))} />
                      </Form.Item>
                    )
                  }
                  if (type === '部门负责人') {
                    return (
                      <Form.Item name={["nodes", idx, "department"]} label="部门负责人" rules={[{ required: true, message: '请选择部门' }]}>
                        <Select placeholder="请选择部门" options={deptOptions.map(d => ({ label: d, value: d }))} />
                      </Form.Item>
                    )
                  }
                  if (type === '指定用户') {
                    return (
                      <Form.Item name={["nodes", idx, "userNames"]} label="指定用户" rules={[{ required: true, message: '请选择用户' }]}>
                        <Select mode="multiple" placeholder="请选择用户" options={userItems.map(u => ({ label: u.name, value: u.name }))} />
                      </Form.Item>
                    )
                  }
                  return null
                }}
              </Form.Item>
            </Col>
          </Row>
        </Col>
      ))}
    </Row>
  )

  const openCreateModal = async () => { await roleQuery(); await userQuery(); formCreate.resetFields(); formCreate.setFieldsValue({ level: '一级审批', flowType: '加急申请', nodes: [{}, {}, {}].slice(0, 1) }); setOpenCreate(true) }
  const openEditModal = async () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个审批流程'); return }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0])
    if (!target) { message.warning('未找到选中审批流程'); return }
    await roleQuery(); await userQuery();
    const count = levelToCount(target.level)
    formEdit.setFieldsValue({
      flowCode: target.flowCode,
      flowName: target.flowName,
      flowType: target.flowType,
      description: target.description,
      level: target.level,
      nodes: (target.nodes || []).concat(Array(Math.max(count - (target.nodes || []).length, 0)).fill({}))
    })
    setOpenEdit(true)
  }

  const onCreateSubmit = () => {
    formCreate.validateFields().then(values => {
      const count = levelToCount(values.level as FlowLevel)
      const nodes: FlowNode[] = (values.nodes || []).slice(0, count)
      createFlow({ flowCode: values.flowCode, flowName: values.flowName, flowType: values.flowType as FlowType, description: values.description, level: values.level as FlowLevel, status: '启用', nodes })
      setOpenCreate(false)
      message.success('新建审批流程成功')
      onQuery()
    })
  }

  const onEditSubmit = () => {
    const id = selectedRowKeys[0] as string
    formEdit.validateFields().then(values => {
      const count = levelToCount(values.level as FlowLevel)
      const nodes: FlowNode[] = (values.nodes || []).slice(0, count)
      editFlow(id, { flowCode: values.flowCode, flowName: values.flowName, flowType: values.flowType as FlowType, description: values.description, level: values.level as FlowLevel, nodes })
      setOpenEdit(false)
      message.success('编辑审批流程成功')
      onQuery()
    })
  }

  const onDelete = () => { if (!selectedRowKeys.length) { message.warning('请先选择审批流程'); return } Modal.confirm({ title: '确认删除', content: '确定要删除选中的审批流程么？操作后不可恢复', cancelText: '取消', onOk: () => deleteFlows(selectedRowKeys as string[]) }) }
  const onEnable = () => { if (!selectedRowKeys.length) { message.warning('请先选择审批流程'); return } enableFlows(selectedRowKeys as string[]); message.success('已启用'); onQuery() }
  const onDisable = () => { if (!selectedRowKeys.length) { message.warning('请先选择审批流程'); return } disableFlows(selectedRowKeys as string[]); message.success('已禁用'); onQuery() }

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={openCreateModal}>新建</Button>
        <Button onClick={openEditModal} disabled={selectedRowKeys.length !== 1}>编辑</Button>
        <Button danger onClick={onDelete} disabled={!selectedRowKeys.length}>删除</Button>
        <Button onClick={onEnable} disabled={!selectedRowKeys.length}>启用</Button>
        <Button onClick={onDisable} disabled={!selectedRowKeys.length}>禁用</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="新建审批流程" open={openCreate} onOk={onCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={formCreate} layout="vertical">
          <Row gutter={24}>
            <Col xs={24}><Form.Item label="审批流程编号" name="flowCode" rules={[{ required: true, message: '请输入审批流程编号' }]}><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item label="审批流程名称" name="flowName" rules={[{ required: true, message: '请输入审批流程名称' }]}><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item label="审批流程类型" name="flowType" rules={[{ required: true, message: '请选择审批流程类型' }]}><Select placeholder="请选择">{(['加急申请','库存采购申请','请假申请'] as FlowType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
            <Col xs={24}><Form.Item label="审批级别" name="level" rules={[{ required: true, message: '请选择审批级别' }]}><Select placeholder="请选择">{(['一级审批','二级审批','三级审批'] as FlowLevel[]).map(l => (<Option key={l} value={l}>{l}</Option>))}</Select></Form.Item></Col>
            <Col xs={24}><Form.Item label="审批流程描述" name="description"><Input /></Form.Item></Col>
          </Row>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const lv = getFieldValue('level') as FlowLevel | undefined
              const count = lv ? levelToCount(lv) : 1
              const nodes = Array(count).fill(null).map(() => ({ approverType: '系统角色' } as FlowNode))
              return renderNodes(nodes)
            }}
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑审批流程" open={openEdit} onOk={onEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={formEdit} layout="vertical">
          <Row gutter={24}>
            <Col xs={24}><Form.Item label="审批流程编号" name="flowCode" rules={[{ required: true, message: '请输入审批流程编号' }]}><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item label="审批流程名称" name="flowName" rules={[{ required: true, message: '请输入审批流程名称' }]}><Input /></Form.Item></Col>
            <Col xs={24}><Form.Item label="审批流程类型" name="flowType" rules={[{ required: true, message: '请选择审批流程类型' }]}><Select placeholder="请选择">{(['加急申请','库存采购申请','请假申请'] as FlowType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item></Col>
            <Col xs={24}><Form.Item label="审批级别" name="level" rules={[{ required: true, message: '请选择审批级别' }]}><Select placeholder="请选择">{(['一级审批','二级审批','三级审批'] as FlowLevel[]).map(l => (<Option key={l} value={l}>{l}</Option>))}</Select></Form.Item></Col>
            <Col xs={24}><Form.Item label="审批流程描述" name="description"><Input /></Form.Item></Col>
          </Row>
          <Form.Item noStyle shouldUpdate>
            {({ getFieldValue }) => {
              const lv = getFieldValue('level') as FlowLevel | undefined
              const count = lv ? levelToCount(lv) : 1
              const nodes = Array(count).fill(null).map(() => ({ approverType: '系统角色' } as FlowNode))
              return renderNodes(nodes)
            }}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}