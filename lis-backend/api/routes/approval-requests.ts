import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

const typeMapCNToEN: Record<string, string> = { '加急申请': 'urgent', '库存采购申请': 'inventory_purchase', '请假申请': 'leave' }
const levelMapCNToNum: Record<string, number> = { '一级审批': 1, '二级审批': 2, '三级审批': 3 }
const statusMapCNToEN: Record<string, string> = { '审批中': 'in_progress', '已通过': 'approved', '已驳回': 'rejected', '已撤回': 'withdrawn' }
const typeMapENToCN: Record<string, string> = { urgent: '加急申请', inventory_purchase: '库存采购申请', leave: '请假申请' }
const levelMapNumToCN: Record<number, string> = { 1: '一级审批', 2: '二级审批', 3: '三级审批' }
const statusMapENToCN: Record<string, string> = { submitted: '审批中', in_progress: '审批中', approved: '已通过', rejected: '已驳回', withdrawn: '已撤回' }

router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const currentUserId = (req.query.current_user_id as string) || ''
  const approvalNos = ((req.query.approvalNos as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const typesCN = ((req.query.types as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const levelsCN = ((req.query.levels as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const statusesCN = ((req.query.statuses as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const createdDate = (req.query.createdDate as string) || ''
  const applicantKeyword = (req.query.applicantKeyword as string) || ''
  const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
  const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
  const from = (pageNo - 1) * pageSize
  const to = from + pageSize - 1
  const types = typesCN.map(t => typeMapCNToEN[t] || t)
  const levels = levelsCN.map(l => levelMapCNToNum[l]).filter(Boolean)
  let statuses: string[] = []
  statusesCN.forEach((s) => {
    if (s === '审批中' || s === '待审批' || s === '已提交') {
      statuses.push('submitted')
      statuses.push('in_progress')
    } else {
      const m = statusMapCNToEN[s]
      if (m) statuses.push(m)
    }
  })
  let q = supabase.from('approval_requests').select('id, request_code, flow_id, flow_type, level, applicant_id, request_content, status, created_at', { count: 'exact' })
  if (approvalNos.length) q = q.in('request_code', approvalNos)
  if (types.length) q = q.in('flow_type', types)
  if (levels.length) q = q.in('level', levels)
  // 当存在 current_user_id 时，后续会按“我提交的/我已审批/待我审批”规则强制保留命中数据；
  // 因此此处不再对状态做数据库级过滤，改为在结果集上做最终筛选（避免把“已通过/已驳回”的命中记录过滤掉）
  if (!currentUserId && statuses.length) q = q.in('status', statuses)
  if (createdDate) {
    const start = new Date(createdDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 1)
    q = q.gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
  }
  const { data, error } = await q.order('created_at', { descending: true }).order('request_code', { ascending: true })
  if (error) return res.status(500).json({ success: false, error: error.message })
  const rows = (data || [])
  const flowIds = Array.from(new Set(rows.map((r: any) => r.flow_id).filter(Boolean)))
  const userIds = Array.from(new Set(rows.map((r: any) => r.applicant_id).filter(Boolean)))
  let flowNameMap: Record<string, string> = {}
  let userNameMap: Record<string, string> = {}
  if (flowIds.length) {
    const flowRes = await supabase.from('approval_flows').select('id, flow_name').in('id', flowIds)
    const flowArr: any[] = Array.isArray(flowRes.data) ? (flowRes.data as any[]) : []
    flowArr.forEach((f: any) => { flowNameMap[f.id] = f.flow_name })
  }
  if (userIds.length) {
    const userRes = await supabase.from('users').select('id, name').in('id', userIds)
    const userArr: any[] = Array.isArray(userRes.data) ? (userRes.data as any[]) : []
    userArr.forEach((u: any) => { userNameMap[u.id] = u.name })
  }
  let list = rows.map((r: any) => ({
    id: r.id,
    approvalNo: r.request_code,
    type: typeMapENToCN[r.flow_type] || r.flow_type,
    flowName: flowNameMap[r.flow_id] || '',
    level: levelMapNumToCN[r.level] || String(r.level),
    status: statusMapENToCN[r.status] || r.status,
    createdDate: r.created_at,
    applicantId: r.applicant_id,
    applicant: userNameMap[r.applicant_id] || '',
    content: r.request_content || ''
  }))
  // 规则过滤（当前用户）
  let filteredIds: Set<string> | null = null
  if (currentUserId) {
    // 用户部门与角色
    const { data: userRow } = await supabase.from('users').select('id, department').eq('id', currentUserId).maybeSingle()
    const userDept = userRow?.department || ''
    const { data: urRows } = await supabase.from('user_roles').select('role_id').eq('user_id', currentUserId)
    const userRoleIds = (urRows || []).map((r: any) => r.role_id)
    // 申请人为当前用户
    const byApplicant = new Set(rows.filter((r: any) => String(r.applicant_id) === currentUserId).map((r: any) => r.id))
    // 当前用户执行过通过/驳回
    const { data: actRows } = await supabase.from('approval_actions').select('request_node_id, operator_id, action')
    const { data: nodeToReq } = await supabase.from('approval_request_nodes').select('id, request_id')
    const reqByAction = new Set<string>()
    const nodeReqMap: Record<string, string> = {}
    ;(nodeToReq || []).forEach((n: any) => { nodeReqMap[String(n.id)] = String(n.request_id) })
    ;(actRows || []).forEach((a: any) => {
      const rid = nodeReqMap[String(a.request_node_id)]
      if (rid && String(a.operator_id) === currentUserId && (a.action === 'approve' || a.action === 'reject')) reqByAction.add(rid)
    })
    // 待审批且当前节点审批人为当前账号
    const requestIds = rows.map((r: any) => r.id)
    const { data: nodeRows } = await supabase.from('approval_request_nodes').select('id, request_id, node_order, status, approver_type, role_id, department').in('request_id', requestIds)
    const { data: assRows } = await supabase.from('approval_request_node_assignees').select('request_node_id, user_id').in('request_node_id', (nodeRows || []).map((n: any) => n.id))
    const assByNode: Record<string, string[]> = {}
    ;(assRows || []).forEach((a: any) => {
      const nid = String(a.request_node_id)
      if (!assByNode[nid]) assByNode[nid] = []
      assByNode[nid].push(String(a.user_id))
    })
    const isUserCurrentApprover = (reqId: string): boolean => {
      const nodes = (nodeRows || []).filter((n: any) => String(n.request_id) === reqId)
      if (!nodes.length) return false
      const pendingNodes = nodes.filter((n: any) => n.status === 'pending')
      if (!pendingNodes.length) return false
      const currentNode = pendingNodes.sort((a: any, b: any) => a.node_order - b.node_order)[0]
      if (!currentNode) return false
      if (currentNode.approver_type === 'role') {
        return userRoleIds.includes(currentNode.role_id)
      }
      if (currentNode.approver_type === 'users') {
        const nid = String(currentNode.id)
        const assignees = assByNode[nid] || []
        return assignees.includes(currentUserId)
      }
      if (currentNode.approver_type === 'department_head') {
        return Boolean(userDept) && userDept === currentNode.department
      }
      return false
    }
    filteredIds = new Set<string>()
    rows.forEach((r: any) => {
      const id = String(r.id)
      if (byApplicant.has(r.id)) { filteredIds.add(id); return }
      if (reqByAction.has(id)) { filteredIds.add(id); return }
      if (isUserCurrentApprover(id)) { filteredIds.add(id); return }
    })
    list = list.filter((d: any) => filteredIds.has(String(d.id)))
  }
  if (applicantKeyword) {
    const kw = applicantKeyword
    list = list.filter(d => (d.applicant || '').includes(kw))
  }
  // 最终状态筛选：当存在状态筛选时，保留“命中用户规则的记录”或“状态命中筛选值”的记录
  if (statuses.length) {
    const allowedCN = new Set<string>(statuses.map(s => statusMapENToCN[s] || s))
    list = list.filter((d: any) => allowedCN.has(String(d.status)))
  }
  const total = list.length
  const paged = list.slice(from, to + 1)
  res.json({ success: true, data: paged, total })
})

router.post('/:id/action', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const action = (req.body?.action as string) || ''
  const reason = (req.body?.reason as string) || ''
  const operator_id = (req.body?.operator_id as string) || ''
  if (!['approve','reject','withdraw'].includes(action)) return res.status(400).json({ success: false, error: '无效操作' })
  const now = new Date().toISOString()
  // 找到当前待审批节点（最小 pending）
  const { data: nodeRows, error: nodeErr } = await supabase
    .from('approval_request_nodes')
    .select('id, request_id, node_order, status')
    .eq('request_id', id)
    .order('node_order', { ascending: true })
  if (nodeErr) return res.status(500).json({ success: false, error: nodeErr.message })
  const pendingNodes = (nodeRows || []).filter((n: any) => n.status === 'pending')
  const currentNode = pendingNodes.sort((a: any, b: any) => a.node_order - b.node_order)[0]
  if (action === 'withdraw') {
    const { error: upReq } = await supabase.from('approval_requests').update({ status: 'withdrawn', updated_at: now }).eq('id', id)
    if (upReq) return res.status(500).json({ success: false, error: upReq.message })
    if (currentNode) {
      await supabase.from('approval_actions').insert({ request_node_id: currentNode.id, operator_id, action, reason })
    }
    return res.json({ success: true })
  }
  if (!currentNode) return res.status(400).json({ success: false, error: '无待审批节点' })
  if (action === 'approve') {
    // 当前节点通过
    const { error: upNode } = await supabase.from('approval_request_nodes').update({ status: 'approved', acted_at: now, comment: reason }).eq('id', currentNode.id)
    if (upNode) return res.status(500).json({ success: false, error: upNode.message })
    await supabase.from('approval_actions').insert({ request_node_id: currentNode.id, operator_id, action, reason })
    // 是否还有下一节点待审批
    const nextNodes = (nodeRows || []).filter((n: any) => n.node_order > currentNode.node_order)
    if (nextNodes.length) {
      // 仍处于待审批
      const { error: upReq } = await supabase.from('approval_requests').update({ status: 'in_progress', updated_at: now }).eq('id', id)
      if (upReq) return res.status(500).json({ success: false, error: upReq.message })
    } else {
      const { error: upReq } = await supabase.from('approval_requests').update({ status: 'approved', updated_at: now }).eq('id', id)
      if (upReq) return res.status(500).json({ success: false, error: upReq.message })
    }
    return res.json({ success: true })
  }
  if (action === 'reject') {
    const { error: upNode } = await supabase.from('approval_request_nodes').update({ status: 'rejected', acted_at: now, comment: reason }).eq('id', currentNode.id)
    if (upNode) return res.status(500).json({ success: false, error: upNode.message })
    await supabase.from('approval_actions').insert({ request_node_id: currentNode.id, operator_id, action, reason })
    const { error: upReq } = await supabase.from('approval_requests').update({ status: 'rejected', updated_at: now }).eq('id', id)
    if (upReq) return res.status(500).json({ success: false, error: upReq.message })
    return res.json({ success: true })
  }
})

router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const flowType = (payload.flow_type as string) || 'inventory_purchase'
  const applicant_id = (payload.applicant_id as string) || ''
  const material_name = (payload.material_name as string) || ''
  const quantity = Number(payload.quantity || 0)
  const reason = (payload.reason as string) || ''
  const order_nos: string[] = Array.isArray(payload.order_nos) ? payload.order_nos : []
  const sample_nos: string[] = Array.isArray(payload.sample_nos) ? payload.sample_nos : []
  const product_names: string[] = Array.isArray(payload.product_names) ? payload.product_names : []
  const urgent_type = (payload.urgent_type as string) || ''
  const { data: flowRow, error: flowErr } = await supabase
    .from('approval_flows')
    .select('id, level')
    .eq('flow_type', flowType)
    .eq('status', 'enabled')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()
  if (flowErr || !flowRow) return res.status(400).json({ success: false, error: '未找到启用的审批流程' })
  const flowId = flowRow.id as string
  const level = flowRow.level as number
  let request_code = (payload.request_code as string) || ''
  if (request_code) {
    const { data: exists } = await supabase.from('approval_requests').select('id').eq('request_code', request_code).maybeSingle()
    if (exists) return res.status(409).json({ success: false, error: '审批单编号已存在' })
  } else {
    request_code = `APR-${Date.now()}`
  }
  let request_content = ''
  if (flowType === 'inventory_purchase') {
    request_content = `库存采购：${material_name} x${quantity}${reason ? `；原因：${reason}` : ''}`
  } else if (flowType === 'urgent') {
    const ordersStr = order_nos.length ? order_nos.join('、') : ''
    const samplesStr = sample_nos.length ? sample_nos.join(',') : ''
    const productsStr = product_names.length ? product_names.join(',') : ''
    request_content = `加急类型：${urgent_type || '-'}${ordersStr ? `；订单：${ordersStr}` : ''}${samplesStr ? `；样本：${samplesStr}` : ''}${productsStr ? `；产品：${productsStr}` : ''}${reason ? `；原因：${reason}` : ''}`
  } else {
    request_content = reason || ''
  }
  const { data: insertRow, error: insErr } = await supabase
    .from('approval_requests')
    .insert({ request_code, flow_id: flowId, flow_type: flowType, level, applicant_id, request_content, status: 'in_progress' })
    .select('id')
    .single()
  if (insErr) return res.status(500).json({ success: false, error: insErr.message })
  const reqId = insertRow?.id as string
  const { data: nodes } = await supabase
    .from('approval_flow_nodes')
    .select('node_order, approver_type, role_id, department')
    .eq('flow_id', flowId)
    .order('node_order', { ascending: true })
  if (nodes && nodes.length) {
    const rows = nodes.map((n: any) => ({ request_id: reqId, node_order: n.node_order, approver_type: n.approver_type, role_id: n.role_id || null, department: n.department || null, status: 'pending' }))
    await supabase.from('approval_request_nodes').insert(rows)
    // 指定用户复制为节点执行人
    const { data: createdNodes } = await supabase.from('approval_request_nodes').select('id, node_order').eq('request_id', reqId).order('node_order', { ascending: true })
    const nodeIdByOrder: Record<number, string> = {}
    ;(createdNodes || []).forEach((r: any) => { nodeIdByOrder[Number(r.node_order)] = String(r.id) })
    const { data: flowNodeIds } = await supabase.from('approval_flow_nodes').select('id, node_order, approver_type').eq('flow_id', flowId)
    const userNodeIds = (flowNodeIds || []).filter((f: any) => f.approver_type === 'users').map((f: any) => f.id)
    if (userNodeIds.length) {
      const { data: nodeUsers } = await supabase.from('approval_flow_node_users').select('node_id, user_id').in('node_id', userNodeIds)
      const assRows: any[] = []
      (nodeUsers || []).forEach((nu: any) => {
        const flowNode = (flowNodeIds || []).find((f: any) => String(f.id) === String(nu.node_id))
        if (flowNode) {
          const reqNodeId = nodeIdByOrder[Number(flowNode.node_order)]
          if (reqNodeId) assRows.push({ request_node_id: reqNodeId, user_id: nu.user_id, status: 'pending' })
        }
      })
      if (assRows.length) await supabase.from('approval_request_node_assignees').insert(assRows)
    }
  }
  res.json({ success: true, id: reqId, request_code })
})

router.get('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const { data: reqRow, error: reqErr } = await supabase
    .from('approval_requests')
    .select('id, request_code, flow_id, flow_type, level, applicant_id, request_content, status, created_at')
    .eq('id', id)
    .maybeSingle()
  if (reqErr) return res.status(500).json({ success: false, error: reqErr.message })
  if (!reqRow) return res.status(404).json({ success: false, error: 'not found' })
  const { data: flowRow } = await supabase.from('approval_flows').select('flow_name').eq('id', reqRow.flow_id).maybeSingle()
  const { data: userRow } = await supabase.from('users').select('id, name').eq('id', reqRow.applicant_id).maybeSingle()
  const { data: nodes } = await supabase
    .from('approval_request_nodes')
    .select('id, node_order, approver_type, role_id, department, status')
    .eq('request_id', id)
    .order('node_order', { ascending: true })
  const roleIds = Array.from(new Set((nodes || []).map((n: any) => n.role_id).filter(Boolean)))
  let roleNameMap: Record<string, string> = {}
  if (roleIds.length) {
    const roleRes = await supabase.from('roles').select('id, role_name').in('id', roleIds)
    const roleArr: any[] = Array.isArray(roleRes.data) ? (roleRes.data as any[]) : []
    roleArr.forEach((r: any) => { roleNameMap[r.id] = r.role_name })
  }
  const nodeIds = Array.from(new Set((nodes || []).map((n: any) => n.id).filter(Boolean)))
  let assByNode: Record<string, string[]> = {}
  if (nodeIds.length) {
    const { data: assRows } = await supabase.from('approval_request_node_assignees').select('request_node_id, user_id').in('request_node_id', nodeIds)
    const userIds = Array.from(new Set((assRows || []).map((a: any) => a.user_id)))
    let nameMap: Record<string, string> = {}
    if (userIds.length) {
      const userRes = await supabase.from('users').select('id, name').in('id', userIds)
      const userArr: any[] = Array.isArray(userRes.data) ? (userRes.data as any[]) : []
      userArr.forEach((u: any) => { nameMap[u.id] = u.name })
    }
    (assRows || []).forEach((a: any) => {
      const nid = String(a.request_node_id)
      const uname = nameMap[a.user_id] || ''
      if (!assByNode[nid]) assByNode[nid] = []
      if (uname) assByNode[nid].push(uname)
    })
  }
  const mapReqStatusCN = (s: string) => {
    if (s === 'withdrawn') return '已撤回'
    if (s === 'approved') return '已通过'
    if (s === 'rejected') return '已驳回'
    // 待审批（兼容历史submitted）
    return '待审批'
  }
  const mapNodeStatusCN = (s: string) => s === 'approved' ? '已通过' : (s === 'rejected' ? '已驳回' : '审批中')
  const flow: Array<{ index: number, approver: string, status: string }> = []
  flow.push({ index: 0, approver: '申请人', status: mapReqStatusCN(String(reqRow.status)) })
  ;(nodes || []).forEach((n: any) => {
    const idx = Number(n.node_order)
    let approver = ''
    if (n.approver_type === 'role') approver = roleNameMap[n.role_id] || ''
    else if (n.approver_type === 'department_head') approver = n.department || ''
    else if (n.approver_type === 'users') approver = (assByNode[String(n.id)] || []).join(',')
    else approver = ''
    flow.push({ index: idx, approver, status: mapNodeStatusCN(String(n.status)) })
  })
  res.json({
    success: true,
    data: {
      id: reqRow.id,
      request_code: reqRow.request_code,
      flow_type: reqRow.flow_type,
      flow_name: flowRow?.flow_name || '',
      level: reqRow.level,
      created_at: reqRow.created_at,
      applicant_id: reqRow.applicant_id,
      applicant: userRow?.name || '',
      content: reqRow.request_content || '',
      flow
    }
  })
})
router.post('/code', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const flowType = (req.body?.flow_type as string) || 'urgent'
  const prefix = flowType === 'urgent' ? 'JZ' : flowType === 'inventory_purchase' ? 'KC' : flowType === 'leave' ? 'QJ' : 'SP'
  const gen = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const ts = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
    const rand = Math.floor(1000 + Math.random() * 9000)
    return `${prefix}${ts}${rand}`
  }
  let code = gen()
  for (let i = 0; i < 3; i++) {
    const { data } = await supabase.from('approval_requests').select('id').eq('request_code', code).maybeSingle()
    if (!data) {
      res.json({ success: true, request_code: code })
      return
    }
    code = gen()
  }
  res.status(500).json({ success: false, error: '编号生成失败' })
})

export default router