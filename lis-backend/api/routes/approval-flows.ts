import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

const typeMapCNToEN: Record<string, string> = { '加急申请': 'urgent', '库存采购申请': 'inventory_purchase', '请假申请': 'leave' }
const levelMapCNToNum: Record<string, number> = { '一级审批': 1, '二级审批': 2, '三级审批': 3 }
const statusMapCNToEN: Record<string, string> = { '启用': 'enabled', '禁用': 'disabled' }
const typeMapENToCN: Record<string, string> = { urgent: '加急申请', inventory_purchase: '库存采购申请', leave: '请假申请' }
const levelMapNumToCN: Record<number, string> = { 1: '一级审批', 2: '二级审批', 3: '三级审批' }
const statusMapENToCN: Record<string, string> = { enabled: '启用', disabled: '禁用' }

router.get('/', async (req: Request, res: Response) => {
  try {
    if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
    const supabase = getSupabase()
    const codes = ((req.query.codes as string) || '').split(',').map(s => s.trim()).filter(Boolean)
    const nameKeyword = (req.query.nameKeyword as string) || ''
    const typesCN = ((req.query.types as string) || '').split(',').map(s => s.trim()).filter(Boolean)
    const levelsCN = ((req.query.levels as string) || '').split(',').map(s => s.trim()).filter(Boolean)
    const statusesCN = ((req.query.statuses as string) || '').split(',').map(s => s.trim()).filter(Boolean)
    const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
    const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
    const from = (pageNo - 1) * pageSize
    const to = from + pageSize - 1
    const types = typesCN.map(t => typeMapCNToEN[t] || t)
    const levels = levelsCN.map(l => levelMapCNToNum[l]).filter(Boolean)
    const statuses = statusesCN.map(s => statusMapCNToEN[s] || s)
    let q = supabase.from('approval_flows').select('id, flow_code, flow_name, flow_type, description, level, status, created_at', { count: 'exact' })
    if (codes.length) q = q.in('flow_code', codes)
    if (nameKeyword) q = q.ilike('flow_name', `%${nameKeyword}%`)
    if (types.length) q = q.in('flow_type', types)
    if (levels.length) q = q.in('level', levels)
    if (statuses.length) q = q.in('status', statuses)
    const { data, error, count } = await q.order('created_at', { descending: true }).order('flow_code', { ascending: true }).range(from, to)
    if (error) return res.status(500).json({ success: false, error: error.message })
    const rows = Array.isArray(data) ? data : []
    const flowIds = rows.map((r: any) => r.id).filter(Boolean)
    let nodes: any[] = []
    if (flowIds.length) {
      const { data: nodeData } = await supabase.from('approval_flow_nodes').select('id, flow_id, node_order, approver_type, role_id, department').in('flow_id', flowIds).order('node_order', { ascending: true })
      nodes = Array.isArray(nodeData) ? nodeData : []
    }
    const roleIds = Array.from(new Set(nodes.map((n: any) => n.role_id).filter(Boolean)))
    let roleNameMap: Record<string, string> = {}
    if (roleIds.length) {
      const roleRes = await supabase.from('roles').select('id, role_name').in('id', roleIds)
      const roleArr: any[] = Array.isArray(roleRes.data) ? roleRes.data as any[] : []
      roleArr.forEach((r: any) => { roleNameMap[r.id] = r.role_name })
    }
    const nodeIds = Array.from(new Set(nodes.map((n: any) => n.id).filter(Boolean)))
    let userNamesByNode: Record<string, string[]> = {}
    if (nodeIds.length) {
      const { data: nodeUsers } = await supabase.from('approval_flow_node_users').select('node_id, user_id').in('node_id', nodeIds)
      const userIds = Array.from(new Set((nodeUsers || []).map((nu: any) => nu.user_id).filter(Boolean)))
      let nameMap: Record<string, string> = {}
      if (userIds.length) {
        const userRes = await supabase.from('users').select('id, name').in('id', userIds)
        const userArr: any[] = Array.isArray(userRes.data) ? userRes.data as any[] : []
        userArr.forEach((u: any) => { nameMap[u.id] = u.name })
      }
      (nodeUsers || []).forEach((nu: any) => {
        const nid = nu.node_id as string
        const uname = nameMap[nu.user_id as string] || ''
        if (!userNamesByNode[nid]) userNamesByNode[nid] = []
        if (uname) userNamesByNode[nid].push(uname)
      })
    }
    const nodesByFlow: Record<string, any[]> = {}
    nodes.forEach((n: any) => {
      const arr = nodesByFlow[n.flow_id] || []
      const approverTypeCN = n.approver_type === 'role' ? '系统角色' : n.approver_type === 'department_head' ? '部门负责人' : n.approver_type === 'users' ? '指定用户' : n.approver_type === 'direct_leader' ? '直接上级' : '间接上级'
      arr.push({ approverType: approverTypeCN, roleName: n.role_id ? roleNameMap[n.role_id] || '' : undefined, department: n.department || undefined, userNames: userNamesByNode[n.id] || undefined })
      nodesByFlow[n.flow_id] = arr
    })
    const list = rows.map((r: any) => ({
      id: r.id,
      flowCode: r.flow_code,
      flowName: r.flow_name,
      flowType: typeMapENToCN[r.flow_type] || r.flow_type,
      description: r.description || '',
      level: levelMapNumToCN[r.level] || String(r.level),
      status: statusMapENToCN[r.status] || r.status,
      createdAt: r.created_at,
      nodes: nodesByFlow[r.id] || []
    }))
    res.json({ success: true, data: list, total: count || 0 })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'unknown error' })
  }
})

router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const { data, error } = await supabase.from('approval_flows').insert({
    flow_code: payload.flowCode,
    flow_name: payload.flowName,
    flow_type: typeMapCNToEN[payload.flowType] || payload.flowType,
    description: payload.description || null,
    level: levelMapCNToNum[payload.level] || payload.level,
    status: statusMapCNToEN[payload.status] || 'enabled'
  }).select('id').single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  const flowId = data?.id as string
  const nodes: any[] = Array.isArray(payload.nodes) ? payload.nodes : []
  if (nodes.length) {
    const rows = nodes.map((n: any, idx: number) => {
      const t = n.approverType as string
      const approver_type = t === '系统角色' ? 'role' : t === '部门负责人' ? 'department_head' : t === '指定用户' ? 'users' : t === '直接上级' ? 'direct_leader' : 'indirect_leader'
      return { flow_id: flowId, node_order: idx + 1, approver_type, role_id: n.roleId || null, department: n.department || null }
    })
    const { error: nodeErr } = await supabase.from('approval_flow_nodes').insert(rows)
    if (nodeErr) return res.status(500).json({ success: false, error: nodeErr.message })
    // 指定用户绑定
    const { data: createdNodes } = await supabase.from('approval_flow_nodes').select('id').eq('flow_id', flowId).order('node_order', { ascending: true })
    const nodeIdsCreated = (createdNodes || []).map((r: any) => r.id)
    const rowsUsers: any[] = []
    nodes.forEach((n: any, idx: number) => {
      if (Array.isArray(n.userIds) && n.userIds.length) {
        const nid = nodeIdsCreated[idx]
        n.userIds.forEach((uid: string) => rowsUsers.push({ node_id: nid, user_id: uid }))
      }
    })
    if (rowsUsers.length) await supabase.from('approval_flow_node_users').insert(rowsUsers)
  }
  res.json({ success: true, id: flowId })
})

router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const patch = req.body || {}
  const upd: any = {}
  if (patch.flowCode) upd.flow_code = patch.flowCode
  if (patch.flowName) upd.flow_name = patch.flowName
  if (patch.flowType) upd.flow_type = typeMapCNToEN[patch.flowType] || patch.flowType
  if (typeof patch.description !== 'undefined') upd.description = patch.description || null
  if (patch.level) upd.level = levelMapCNToNum[patch.level] || patch.level
  const { error } = await supabase.from('approval_flows').update(upd).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  if (Array.isArray(patch.nodes)) {
    await supabase.from('approval_flow_nodes').delete().eq('flow_id', id)
    const rows = patch.nodes.map((n: any, idx: number) => {
      const t = n.approverType as string
      const approver_type = t === '系统角色' ? 'role' : t === '部门负责人' ? 'department_head' : t === '指定用户' ? 'users' : t === '直接上级' ? 'direct_leader' : 'indirect_leader'
      return { flow_id: id, node_order: idx + 1, approver_type, role_id: n.roleId || null, department: n.department || null }
    })
    const { error: nodeErr } = await supabase.from('approval_flow_nodes').insert(rows)
    if (nodeErr) return res.status(500).json({ success: false, error: nodeErr.message })
    const { data: createdNodes } = await supabase.from('approval_flow_nodes').select('id').eq('flow_id', id).order('node_order', { ascending: true })
    const rowsUsers: any[] = []
    patch.nodes.forEach((n: any, idx: number) => {
      if (Array.isArray(n.userIds) && n.userIds.length) {
        const nid = (createdNodes || [])[idx]?.id
        n.userIds.forEach((uid: string) => rowsUsers.push({ node_id: nid, user_id: uid }))
      }
    })
    if (rowsUsers.length) await supabase.from('approval_flow_node_users').insert(rowsUsers)
  }
  res.json({ success: true })
})

router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('approval_flows').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

router.post('/enable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('approval_flows').update({ status: 'enabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

router.post('/disable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('approval_flows').update({ status: 'disabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

export default router