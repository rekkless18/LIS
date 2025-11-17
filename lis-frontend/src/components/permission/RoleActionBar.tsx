// 功能描述：角色配置页面操作区组件，提供新建、编辑、删除、启用/禁用、权限配置等交互；权限树动态加载后端数据
// 参数说明：
//  - onQuery：触发查询函数，用于刷新数据
//  - onReset：触发重置函数，用于清空筛选
// 返回值类型及用途：React.FC 组件，承载工具栏与弹窗逻辑
import React, { useEffect, useState } from 'react'
import { Space, Button, Modal, Form, Input, Select, Tree, message } from 'antd'
import { useRoleConfigStore, RoleType, EnableStatus } from '@/stores/permissionRole'

const { Option } = Select

interface Props { onQuery: () => void; onReset: () => void }

export const RoleActionBar: React.FC<Props> = ({ onQuery, onReset }) => {
  const { selectedRowKeys, filteredItems, createItem, editItem, deleteItems, enableItems, disableItems, setPermissions } = useRoleConfigStore()
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openPerms, setOpenPerms] = useState(false)
  const [form] = Form.useForm()
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([])
  const [treeData, setTreeData] = useState<any[]>([])
  const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'

  useEffect(() => {
    const loadPerms = async () => {
      const resp = await fetch(`${API_BASE}/permissions`)
      const json = await resp.json()
      const list: any[] = json.data || []
      const GROUP_LABELS: Record<string, string> = {
        order: '订单管理',
        logistics: '物流管理',
        samples: '样本管理',
        test: '实验管理',
        report: '报告管理',
        labmanage: '实验室管理',
        inventory: '库存管理',
        approval: '审批管理',
        config: '后台管理',
        permission: '权限管理',
        system: '系统管理'
      }
      const TEST_SECOND_LABELS: Record<string, string> = {
        routine: '普检',
        special: '特检',
        ms: '质谱'
      }
      const ALLOWED_LEAF_PATHS = new Set<string>([
        '/order/orderquery','/order/sample','/order/delivery',
        '/logistics/logisticsquery',
        '/samples/samplesquery',
        '/test/routine/routineexperiment','/test/routine/routineexception',
        '/test/special/tech-route','/test/special/preprocess','/test/special/pre-run','/test/special/sequencing','/test/special/bioinfo','/test/special/qpcr','/test/special/specialaudit','/test/special/specialexception',
        '/test/ms/msexperiment','/test/ms/msaudit','/test/ms/msexception',
        '/report/generate','/report/audit','/report/query','/report/exception',
        '/labmanage/environmentmanage','/labmanage/equipmentmanage',
        '/inventory/inventoryquery',
        '/approval/approvalquery',
        '/config/configpackage','/config/configproduct','/config/configtest-item','/config/configcustomer','/config/configreport','/config/configtech-route','/config/configexperiment','/config/configapproval',
        '/permission/user','/permission/role',
        '/system/global'
      ])
      const groups: Record<string, any> = {}
      list.forEach((p: any) => {
        const rp: string = p.route_path || ''
        if (!ALLOWED_LEAF_PATHS.has(rp)) return
        const parts = rp.split('/').filter(Boolean)
        if (!parts.length) return
        const top = parts[0]
        const groupKey = top === 'sample' ? 'samples' : top
        const groupLabel = GROUP_LABELS[groupKey]
        if (!groupLabel) return
        if (!groups[groupKey]) groups[groupKey] = { title: groupLabel, key: groupKey, children: [] }
        if (groupKey === 'test' && parts.length >= 3) {
          const sec = parts[1]
          const secLabel = TEST_SECOND_LABELS[sec]
          if (!secLabel) return
          let secNode = groups[groupKey].children.find((n: any) => n.key === `test:${sec}`)
          if (!secNode) {
            secNode = { title: secLabel, key: `test:${sec}`, children: [] }
            groups[groupKey].children.push(secNode)
          }
          secNode.children.push({ title: p.perm_name, key: p.perm_key })
        } else {
          groups[groupKey].children.push({ title: p.perm_name, key: p.perm_key })
        }
      })
      const nodes = Object.values(groups)
      setTreeData(nodes as any[])
    }
    loadPerms()
  }, [])

  /**
   * 功能描述：根据选中的节点键集合，收集所有叶子权限键（perm_key），用于保存到后端
   * 参数说明：
   *  - keys：React.Key[]，当前树选中的键（可能包含父级与叶子）
   *  - tree：树数据（包含分组与叶子）
   * 返回值类型及用途：string[]，叶子权限键集合；用于 setPermissions 持久化
   */
  const collectLeafPermKeys = (keys: React.Key[], tree: any[]): string[] => {
    const byKey = new Map<string, any>()
    const indexTree = (nodes: any[]) => {
      nodes.forEach((n) => {
        byKey.set(String(n.key), n)
        if (n.children?.length) indexTree(n.children)
      })
    }
    indexTree(tree)
    const leaves: string[] = []
    const collectLeaves = (node: any) => {
      if (!node) return
      if (!node.children || node.children.length === 0) {
        leaves.push(String(node.key))
      } else {
        node.children.forEach((c: any) => collectLeaves(c))
      }
    }
    keys.forEach((k) => collectLeaves(byKey.get(String(k))))
    return Array.from(new Set(leaves))
  }

  const handleOpenCreate = () => { form.resetFields(); setOpenCreate(true) } // 打开新建弹窗
  const handleCreateSubmit = () => {
    // 功能：提交新建角色；参数：表单值；返回：刷新数据
    form.validateFields().then(values => {
      createItem({ roleCode: values.roleCode, roleName: values.roleName, roleType: values.roleType as RoleType, status: values.status as EnableStatus, boundUserCount: 0, createdAt: new Date().toISOString() })
      setOpenCreate(false)
    })
  }

  const handleOpenEdit = () => {
    // 功能：打开编辑弹窗；参数：当前选中角色；返回：填充表单
    if (selectedRowKeys.length !== 1) return
    const target = filteredItems.find(d => d.id === selectedRowKeys[0])
    if (!target) return
    form.setFieldsValue({ roleCode: target.roleCode, roleName: target.roleName, roleType: target.roleType, status: target.status })
    setOpenEdit(true)
  }
  const handleEditSubmit = () => {
    // 功能：提交编辑；参数：表单值与选中ID；返回：刷新数据
    const id = selectedRowKeys[0] as string
    form.validateFields().then(values => {
      editItem(id, { roleCode: values.roleCode, roleName: values.roleName, roleType: values.roleType as RoleType, status: values.status as EnableStatus })
      setOpenEdit(false)
    })
  }

  const handleDelete = () => {
    // 功能：二次确认后执行删除角色；参数：选中ID集合；返回：删除完成
    if (!selectedRowKeys.length) { message.warning('请先选择角色'); return }
    Modal.confirm({ title: '确认删除', content: '确认删除选中的角色？该操作不可恢复', cancelText: '取消', onOk: () => deleteItems(selectedRowKeys as string[]) })
  }
  const handleEnable = () => {
    // 功能：二次确认后执行启用角色；参数：选中ID集合；返回：启用完成
    if (!selectedRowKeys.length) { message.warning('请先选择角色'); return }
    Modal.confirm({ title: '确认启用', content: '确认启用选中的角色？', cancelText: '取消', onOk: () => enableItems(selectedRowKeys as string[]) })
  }
  const handleDisable = () => {
    // 功能：二次确认后执行禁用角色；参数：选中ID集合；返回：禁用完成
    if (!selectedRowKeys.length) { message.warning('请先选择角色'); return }
    Modal.confirm({ title: '确认禁用', content: '确认禁用选中的角色？', cancelText: '取消', onOk: () => disableItems(selectedRowKeys as string[]) })
  }

  const handleOpenPerms = () => {
    // 功能：打开权限配置弹窗并加载角色已绑定权限；参数：选中角色ID；返回：设置checkedKeys
    if (selectedRowKeys.length !== 1) return
    const target = filteredItems.find(d => d.id === selectedRowKeys[0])
    fetch(`${API_BASE}/roles/${target?.id}/permissions`).then(r => r.json()).then(j => {
      setCheckedKeys(((j.data || []) as string[]))
    })
    setOpenPerms(true)
  }
  const handlePermsSubmit = async () => {
    // 功能：提交权限绑定并提示成功；参数：选中权限键集合；返回：完成后弹出toast
    const id = selectedRowKeys[0] as string
    const leafKeys = collectLeafPermKeys(checkedKeys, treeData)
    await setPermissions(id, leafKeys)
    message.success('配置成功')
    setOpenPerms(false)
  }

  return (
    <div className="flex justify-between items-center py-2">
      <Space>
        <Button type="primary" onClick={handleOpenCreate}>新建</Button>
        <Button onClick={handleOpenEdit} disabled={!selectedRowKeys.length}>编辑</Button>
        <Button danger onClick={handleDelete} disabled={!selectedRowKeys.length}>删除</Button>
        <Button onClick={handleEnable} disabled={!selectedRowKeys.length}>启用</Button>
        <Button onClick={handleDisable} disabled={!selectedRowKeys.length}>禁用</Button>
        <Button onClick={handleOpenPerms} disabled={selectedRowKeys.length !== 1}>权限配置</Button>
      </Space>
      <Space>
        <Button onClick={onReset}>重置</Button>
        <Button type="primary" onClick={onQuery}>查询</Button>
      </Space>

      <Modal title="新建角色" open={openCreate} onOk={handleCreateSubmit} onCancel={() => setOpenCreate(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="角色编码" name="roleCode" rules={[{ required: true, message: '请输入角色编码' }]}><Input /></Form.Item>
          <Form.Item label="角色名称" name="roleName" rules={[{ required: true, message: '请输入角色名称' }]}><Input /></Form.Item>
          <Form.Item label="角色类型" name="roleType" rules={[{ required: true, message: '请选择角色类型' }]}><Select placeholder="请选择">{(['内部角色','外部角色'] as RoleType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="编辑角色" open={openEdit} onOk={handleEditSubmit} onCancel={() => setOpenEdit(false)} okText="提交" cancelText="关闭">
        <Form form={form} layout="vertical">
          <Form.Item label="角色编码" name="roleCode" rules={[{ required: true, message: '请输入角色编码' }]}><Input /></Form.Item>
          <Form.Item label="角色名称" name="roleName" rules={[{ required: true, message: '请输入角色名称' }]}><Input /></Form.Item>
          <Form.Item label="角色类型" name="roleType" rules={[{ required: true, message: '请选择角色类型' }]}><Select placeholder="请选择">{(['内部角色','外部角色'] as RoleType[]).map(t => (<Option key={t} value={t}>{t}</Option>))}</Select></Form.Item>
          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}><Select placeholder="请选择">{(['启用','禁用'] as EnableStatus[]).map(s => (<Option key={s} value={s}>{s}</Option>))}</Select></Form.Item>
        </Form>
      </Modal>

      <Modal title="权限配置" open={openPerms} onOk={handlePermsSubmit} onCancel={() => setOpenPerms(false)} okText="保存" cancelText="关闭" width={640}>
        <Tree checkable checkedKeys={checkedKeys} onCheck={(keys) => setCheckedKeys(keys as React.Key[])} treeData={treeData as any} />
      </Modal>
    </div>
  )
}

