import React, { useState } from 'react'
import { Space, Button, Modal, Form, Input, Select, message } from 'antd'
import { useUserConfigStore, UserType, EnableStatus } from '@/stores/permissionUser'
import { useRoleConfigStore } from '@/stores/permissionRole'

const { Option } = Select

interface Props { onQuery: () => void; onReset: () => void }

export const UserActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, filteredItems, createItem, editItem, deleteItems, enableItems, disableItems, setRoles, resetPassword } = useUserConfigStore()
  const roleItems = useRoleConfigStore(s => s.items)
  const [rolesOptions, setRolesOptions] = useState<{ label: string, value: string }[]>([])
  const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
  const loadRolesOptions = async () => {
    // 功能：从后端加载角色列表并转换为下拉选项；参数：无；返回：更新rolesOptions
    try {
      const resp = await fetch(`${API_BASE}/roles`)
      const json = await resp.json()
      const opts = ((json.data || []) as any[]).map(r => ({ label: r.role_name as string, value: r.id as string }))
      setRolesOptions(opts)
    } catch (_) {
      setRolesOptions([])
    }
  }
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openRoles, setOpenRoles] = useState(false)
  const [openResetResult, setOpenResetResult] = useState(false)
  const [resetPwd, setResetPwd] = useState('')
  const [pwdModalTitle, setPwdModalTitle] = useState('')
  const [createForm] = Form.useForm()
  const [editForm] = Form.useForm()
  const [rolesForm] = Form.useForm()
  const [currentUser, setCurrentUser] = useState<any>(null)

  const handleOpenCreate = () => { setOpenCreate(true) }
  const handleCreateSubmit = () => {
    createForm.validateFields().then(values => {
      createItem({ account: values.account, name: values.name, phone: values.phone, email: values.email, department: values.department, userType: values.userType as UserType, status: '启用', createdAt: new Date().toISOString() })
      const initPwd = `${values.account}123456`
      setResetPwd(initPwd)
      setPwdModalTitle('初始密码')
      setOpenCreate(false)
      setOpenResetResult(true)
      message.success('新建用户成功')
    })
  }

  const handleOpenEdit = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个用户'); return }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0])
    if (!target) { message.warning('未找到选中用户'); return }
    setCurrentUser(target)
    setOpenEdit(true)
    fetch(`${API_BASE}/users/${target.id}`).then(async (r) => {
      if (!r.ok) return
      const j = await r.json()
      const u = j?.data || {}
      setCurrentUser({
        ...target,
        email: u.email ?? target.email,
        phone: u.phone ?? target.phone,
        department: u.department ?? target.department,
      })
    }).catch(() => {
      setCurrentUser(target)
    })
  }
  const handleEditSubmit = () => {
    const id = selectedRowKeys[0] as string
    editForm.validateFields().then(values => {
      editItem(id, { account: values.account, name: values.name, phone: values.phone, email: values.email, department: values.department, userType: values.userType as UserType, roles: values.roles || [] })
      setOpenEdit(false)
      message.success('编辑用户成功')
    })
  }

  const handleDelete = () => {
    // 功能：二次确认后执行删除；参数：选中ID集合；返回：删除完成
    if (!selectedRowKeys.length) { message.warning('请先选择用户'); return }
    Modal.confirm({ title: '确认删除', content: '确认删除选中的用户？该操作不可恢复', cancelText: '取消', onOk: () => deleteItems(selectedRowKeys as string[]) })
  }
  const handleEnable = () => {
    // 功能：二次确认后执行启用；参数：选中ID集合；返回：启用完成
    if (!selectedRowKeys.length) { message.warning('请先选择用户'); return }
    Modal.confirm({ title: '确认启用', content: '确认启用选中的用户？', cancelText: '取消', onOk: () => enableItems(selectedRowKeys as string[]) })
  }
  const handleDisable = () => {
    // 功能：二次确认后执行禁用；参数：选中ID集合；返回：禁用完成
    if (!selectedRowKeys.length) { message.warning('请先选择用户'); return }
    Modal.confirm({ title: '确认禁用', content: '确认禁用选中的用户？', cancelText: '取消', onOk: () => disableItems(selectedRowKeys as string[]) })
  }

  const handleOpenRoles = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个用户'); return }
    const target = filteredItems.find(d => d.id === selectedRowKeys[0])
    if (!target) { message.warning('未找到选中用户'); return }
    setOpenRoles(true)
    rolesForm.setFieldsValue({ roles: target.roles })
    loadRolesOptions()
    // 功能：从后端获取该用户已绑定的角色ID并映射为角色名称回填
    fetch(`${API_BASE}/users/${target.id}/roles`).then(r => r.json()).then(async (j) => {
      const ids: string[] = Array.isArray(j?.data) ? (j.data as string[]) : []
      try {
        // 直接回填角色ID，Select 的 value 使用ID，可稳定显示
        rolesForm.setFieldsValue({ roles: ids })
      } catch (_) {
        rolesForm.setFieldsValue({ roles: ids })
      }
    })
  }
  const handleRolesSubmit = async () => {
    const id = selectedRowKeys[0] as string
    const values = rolesForm.getFieldsValue()
    await setRoles(id, values.roles || [])
    setOpenRoles(false)
    message.success('角色配置已保存')
    onQuery()
  }

  const handleResetPwd = () => {
    if (selectedRowKeys.length !== 1) { message.warning('请选择且仅选择一个用户'); return }
    Modal.confirm({ title: '确认重置密码', content: '确定要重置选中用户的密码么？操作后不可恢复', cancelText: '取消', onOk: () => confirmResetPwd() })
  }
  const confirmResetPwd = async () => {
    const id = selectedRowKeys[0] as string
    const pwd = await resetPassword(id)
    setResetPwd(pwd)
    setPwdModalTitle('重置密码')
    setOpenResetResult(true)
  }

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOpenCreate}>新建</Button>
        <Button onClick={handleOpenEdit} disabled={!selectedRowKeys.length}>编辑</Button>
        <Button danger onClick={handleDelete} disabled={!selectedRowKeys.length}>删除</Button>
        <Button onClick={handleEnable} disabled={!selectedRowKeys.length}>启用</Button>
        <Button onClick={handleDisable} disabled={!selectedRowKeys.length}>禁用</Button>
        <Button onClick={handleOpenRoles} disabled={selectedRowKeys.length !== 1}>角色配置</Button>
        <Button onClick={handleResetPwd} disabled={selectedRowKeys.length !== 1}>重置密码</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="新建用户" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭" afterOpenChange={(o) => { if (o) createForm.resetFields() }}>
        <Form form={createForm} layout="vertical">
          <Form.Item label="用户账号" name="account" rules={[{ required: true, message: '请输入用户账号' }]}><Input /></Form.Item>
          <Form.Item label="用户姓名" name="name" rules={[{ required: true, message: '请输入用户姓名' }]}><Input /></Form.Item>
          <Form.Item label="联系方式" name="phone" rules={[{ required: true, message: '请输入联系方式' }]}><Input /></Form.Item>
          <Form.Item label="邮箱" name="email"><Input /></Form.Item>
          <Form.Item label="用户类型" name="userType" rules={[{ required: true, message: '请选择用户类型' }]}><Select placeholder="请选择">{(['内部用户','外部用户'] as UserType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="部门" name="department" rules={[{ required: true, message: '请选择部门' }]}><Select placeholder="请选择部门" options={deptOptions.map(d => ({ label: d, value: d }))} /></Form.Item>
          
        </Form>
      </Modal>

      <Modal title="编辑用户" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭" afterOpenChange={(o) => {
        if (o && currentUser) {
          editForm.setFieldsValue({
            account: currentUser.account,
            name: currentUser.name,
            userType: currentUser.userType,
            roles: currentUser.roles,
            email: currentUser.email,
            phone: currentUser.phone,
            department: currentUser.department,
          })
        }
      }}>
        <Form form={editForm} layout="vertical">
          <Form.Item label="用户账号" name="account" rules={[{ required: true, message: '请输入用户账号' }]}><Input /></Form.Item>
          <Form.Item label="用户姓名" name="name" rules={[{ required: true, message: '请输入用户姓名' }]}><Input /></Form.Item>
          <Form.Item label="联系方式" name="phone" rules={[{ required: true, message: '请输入联系方式' }]}><Input /></Form.Item>
          <Form.Item label="邮箱" name="email"><Input /></Form.Item>
          <Form.Item label="用户类型" name="userType" rules={[{ required: true, message: '请选择用户类型' }]}><Select placeholder="请选择">{(['内部用户','外部用户'] as UserType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="部门" name="department" rules={[{ required: true, message: '请选择部门' }]}><Select placeholder="请选择部门" options={deptOptions.map(d => ({ label: d, value: d }))} /></Form.Item>
          <Form.Item label="绑定角色" name="roles"><Select mode="multiple" placeholder="请选择角色" options={roleItems.map(i => ({ label: i.roleName, value: i.roleName }))} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="角色配置" open={openRoles} onOk={handleRolesSubmit} onCancel={() => setOpenRoles(false)} okText="保存" cancelText="关闭">
        <Form form={rolesForm} layout="vertical">
          <Form.Item label="绑定角色" name="roles" rules={[{ required: true, message: '请选择角色' }]}> 
            <Select mode="multiple" placeholder="请选择角色" options={rolesOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={pwdModalTitle || '密码'} open={openResetResult} onOk={() => setOpenResetResult(false)} onCancel={() => setOpenResetResult(false)} okText="确定" cancelText="取消">
        新密码为：{resetPwd}
      </Modal>
    </div>
  )
}
  const deptOptions: string[] = ['销售部','采购部','门诊部','检验科','财务部','人力部','后勤部','行政部','其他','运维部']
