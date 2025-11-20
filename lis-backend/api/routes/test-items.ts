import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询检测项列表，支持多维筛选与分页
 * 参数说明：
 *  - req.query.codes：字符串，逗号分隔的检测项编码列表，精确匹配
 *  - req.query.nameKeyword：字符串，名称模糊匹配关键字
 *  - req.query.itemTypes：字符串，逗号分隔的检测项类型列表（中文枚举）
 *  - req.query.judgeTypes：字符串，逗号分隔的结果判断类型列表（中文枚举）
 *  - req.query.statuses：字符串，逗号分隔的状态列表（'启用'/'禁用'）
 *  - req.query.createdStart/createdEnd：ISO字符串，创建时间范围（闭开区间：[start, end)）
 *  - req.query.pageNo/pageSize：分页参数（默认1/20）
 * 返回值类型及用途：
 *  - JSON：{ success, data, total }，供前端表格渲染
 */
router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const codes = ((req.query.codes as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const nameKeyword = (req.query.nameKeyword as string) || ''
  const itemTypes = ((req.query.itemTypes as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const judgeTypes = ((req.query.judgeTypes as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const statusesCN = ((req.query.statuses as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const createdStart = (req.query.createdStart as string) || ''
  const createdEnd = (req.query.createdEnd as string) || ''
  const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
  const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
  const from = (pageNo - 1) * pageSize
  const to = from + pageSize - 1
  const statuses = statusesCN.map(s => (s === '启用' ? 'enabled' : s === '禁用' ? 'disabled' : s))
  let q = supabase.from('test_items').select('id,item_code,item_name,item_type,judgement_type,status,limit_upper,limit_lower,unit,qualitative_value,created_at', { count: 'exact' })
  if (codes.length) q = q.in('item_code', codes)
  if (nameKeyword) q = q.ilike('item_name', `%${nameKeyword}%`)
  if (itemTypes.length) q = q.in('item_type', itemTypes)
  if (judgeTypes.length) q = q.in('judgement_type', judgeTypes)
  if (statuses.length) q = q.in('status', statuses)
  if (createdStart) q = q.gte('created_at', createdStart)
  if (createdEnd) q = q.lt('created_at', createdEnd)
  const { data, error, count } = await q.order('created_at', { descending: true }).order('item_code', { ascending: true }).range(from, to)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const rows = (data || []).map((r: any) => ({
    id: r.id,
    item_code: r.item_code,
    item_name: r.item_name,
    item_type: r.item_type,
    judgement_type: r.judgement_type,
    status: r.status,
    limit_upper: r.limit_upper,
    limit_lower: r.limit_lower,
    unit: r.unit,
    qualitative_value: r.qualitative_value,
    created_at: r.created_at,
  }))
  const aggParents = rows.filter(r => r.judgement_type === '聚合').map(r => r.id)
  if (aggParents.length) {
    const { data: aggData, error: aggErr } = await supabase
      .from('test_item_aggregate_rules')
      .select('parent_item_id, child_item_id, condition, result')
      .in('parent_item_id', aggParents)
    if (!aggErr && aggData) {
      const byParent: Record<string, { items: { child_item_id: string, result: string }[]; condition?: string }> = {}
      aggData.forEach((row: any) => {
        const pid = row.parent_item_id as string
        if (!byParent[pid]) byParent[pid] = { items: [], condition: row.condition }
        byParent[pid].items.push({ child_item_id: row.child_item_id, result: row.result })
        byParent[pid].condition = byParent[pid].condition || row.condition
      })
      rows.forEach(r => {
        if (byParent[r.id]) {
          ;(r as any).aggregate_items = byParent[r.id].items
          ;(r as any).aggregate_condition = byParent[r.id].condition
        }
      })
    }
  }
  res.json({ success: true, data: rows, total: count || 0 })
})

/**
 * 功能描述：新建检测项
 * 参数说明：
 *  - req.body：{ item_code, item_name, item_type, judgement_type, status }
 * 返回值类型及用途：
 *  - JSON：{ success, id }，供前端提示与刷新
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const baseInsert: any = {
    item_code: payload.item_code,
    item_name: payload.item_name,
    item_type: payload.item_type,
    judgement_type: payload.judgement_type,
    status: payload.status,
  }
  if (payload.judgement_type === '上限' || payload.judgement_type === '上下限') baseInsert.limit_upper = payload.limit_upper ?? null
  if (payload.judgement_type === '下限' || payload.judgement_type === '上下限') baseInsert.limit_lower = payload.limit_lower ?? null
  if (payload.judgement_type === '上限' || payload.judgement_type === '下限' || payload.judgement_type === '上下限') baseInsert.unit = payload.unit ?? null
  if (payload.judgement_type === '定性' || payload.judgement_type === '阴阳性') baseInsert.qualitative_value = payload.qualitative_value ?? null
  const { data, error } = await supabase.from('test_items').insert(baseInsert).select('id').single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  if (payload.judgement_type === '聚合') {
    const parentId = data?.id as string
    const items: { child_id: string, result: string }[] = (payload.items as any[]) || []
    const condition: string = payload.condition || '任意满足'
    if (items.length) {
      const rows = items.map((it) => ({ parent_item_id: parentId, child_item_id: it.child_id, condition, result: it.result }))
      const { error: aggErr } = await supabase.from('test_item_aggregate_rules').insert(rows)
      if (aggErr) return res.status(500).json({ success: false, error: aggErr.message })
    }
  }
  res.json({ success: true, id: data?.id })
})

/**
 * 功能描述：编辑检测项
 * 参数说明：
 *  - req.params.id：检测项ID
 *  - req.body：允许更新的字段（item_code/item_name/item_type/judgement_type/status）
 * 返回值类型及用途：
 *  - JSON：{ success }
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const patch = req.body || {}
  const update: any = {}
  if (patch.item_code) update.item_code = patch.item_code
  if (patch.item_name) update.item_name = patch.item_name
  if (patch.item_type) update.item_type = patch.item_type
  if (patch.judgement_type) update.judgement_type = patch.judgement_type
  if (patch.status) update.status = patch.status
  if (typeof patch.limit_upper !== 'undefined') update.limit_upper = patch.limit_upper
  if (typeof patch.limit_lower !== 'undefined') update.limit_lower = patch.limit_lower
  if (typeof patch.unit !== 'undefined') update.unit = patch.unit
  if (typeof patch.qualitative_value !== 'undefined') update.qualitative_value = patch.qualitative_value
  const { error } = await supabase.from('test_items').update(update).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  if (update.judgement_type === '聚合' || typeof patch.items !== 'undefined' || typeof patch.condition !== 'undefined') {
    await supabase.from('test_item_aggregate_rules').delete().eq('parent_item_id', id)
    const items: { child_id: string, result: string }[] = (patch.items as any[]) || []
    const condition: string = patch.condition || '任意满足'
    if (items.length) {
      const rows = items.map((it) => ({ parent_item_id: id, child_item_id: it.child_id, condition, result: it.result }))
      const { error: aggErr } = await supabase.from('test_item_aggregate_rules').insert(rows)
      if (aggErr) return res.status(500).json({ success: false, error: aggErr.message })
    }
  }
  res.json({ success: true })
})

/**
 * 功能描述：批量删除检测项
 * 参数说明：
 *  - req.body.ids：ID数组
 * 返回值类型及用途：
 *  - JSON：{ success, deleted }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('test_items').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

/**
 * 功能描述：批量启用检测项
 * 参数说明：
 *  - req.body.ids：ID数组
 * 返回值类型及用途：
 *  - JSON：{ success }
 */
router.post('/enable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('test_items').update({ status: 'enabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量禁用检测项
 * 参数说明：
 *  - req.body.ids：ID数组
 * 返回值类型及用途：
 *  - JSON：{ success }
 */
router.post('/disable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('test_items').update({ status: 'disabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

export default router

/**
 * 功能描述：获取全部启用的检测项供聚合选择
 * 参数说明：
 *  - req.query.excludeId：可选，排除的父项ID（编辑时避免选择自身）
 * 返回值类型及用途：
 *  - JSON：{ success, data }，包含 id/item_code/item_name
 */
router.get('/enabled', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const excludeId = (req.query.excludeId as string) || ''
  let q = supabase.from('test_items').select('id,item_code,item_name').eq('status', 'enabled')
  if (excludeId) q = q.neq('id', excludeId)
  const { data, error } = await q.order('item_code', { ascending: true })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})