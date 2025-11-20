import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询产品列表，支持编码/名称/类型/状态/创建日期范围筛选与分页
 * 参数说明：
 *  - req.query.codes：逗号分隔产品编码列表
 *  - req.query.nameKeyword：名称模糊匹配
 *  - req.query.types：逗号分隔类型（中文枚举）
 *  - req.query.statuses：逗号分隔状态（启用/禁用）
 *  - req.query.createdStart/createdEnd：创建时间范围（ISO字符串）
 *  - req.query.pageNo/pageSize：分页参数
 * 返回值类型及用途：
 *  - JSON：{ success, data, total }，供前端表格展示
 */
router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const codes = ((req.query.codes as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const nameKeyword = (req.query.nameKeyword as string) || ''
  const types = ((req.query.types as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const statusesCN = ((req.query.statuses as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const createdStart = (req.query.createdStart as string) || ''
  const createdEnd = (req.query.createdEnd as string) || ''
  const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
  const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
  const from = (pageNo - 1) * pageSize
  const to = from + pageSize - 1
  const statuses = statusesCN.map(s => (s === '启用' ? 'enabled' : s === '禁用' ? 'disabled' : s))
  let q = supabase.from('products').select('id,product_code,product_name,product_type,status,created_at', { count: 'exact' })
  if (codes.length) q = q.in('product_code', codes)
  if (nameKeyword) q = q.ilike('product_name', `%${nameKeyword}%`)
  if (types.length) q = q.in('product_type', types)
  if (statuses.length) q = q.in('status', statuses)
  if (createdStart) q = q.gte('created_at', createdStart)
  if (createdEnd) q = q.lt('created_at', createdEnd)
  const { data, error, count } = await q.order('created_at', { descending: true }).order('product_code', { ascending: true }).range(from, to)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const rows = (data || []).map((r: any) => ({ id: r.id, product_code: r.product_code, product_name: r.product_name, product_type: r.product_type, status: r.status, created_at: r.created_at }))
  const productIds = rows.map(r => r.id)
  let testNamesByProduct: Record<string, string[]> = {}
  let testIdsByProduct: Record<string, string[]> = {}
  if (productIds.length) {
    const { data: links, error: linkErr } = await supabase
      .from('product_test_items')
      .select('product_id, test_item_id')
      .in('product_id', productIds)
    if (!linkErr && links?.length) {
      const tids = Array.from(new Set(links.map((l: any) => l.test_item_id)))
      const { data: items, error: itemErr } = await supabase
        .from('test_items')
        .select('id, item_name')
        .in('id', tids)
      const nameMap: Record<string, string> = {}
      if (!itemErr && items) items.forEach((it: any) => { nameMap[it.id] = it.item_name })
      links.forEach((l: any) => {
        const pid = l.product_id as string
        const tid = l.test_item_id as string
        const tname = nameMap[tid] || ''
        if (!testNamesByProduct[pid]) testNamesByProduct[pid] = []
        if (!testIdsByProduct[pid]) testIdsByProduct[pid] = []
        if (tname) testNamesByProduct[pid].push(tname)
        testIdsByProduct[pid].push(tid)
      })
    }
  }
  const final = rows.map(r => ({ ...r, test_item_names: testNamesByProduct[r.id] || [], test_item_ids: testIdsByProduct[r.id] || [] }))
  res.json({ success: true, data: final, total: count || 0 })
})

/**
 * 功能描述：创建产品
 * 参数说明：req.body = { product_code, product_name, product_type, status }
 * 返回值类型及用途：JSON { success, id }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const { data, error } = await supabase.from('products').insert({
    product_code: payload.product_code,
    product_name: payload.product_name,
    product_type: payload.product_type,
    status: payload.status,
  }).select('id').single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  const pid = data?.id as string
  const testIds: string[] = (payload.test_item_ids as string[]) || []
  if (testIds.length) {
    const rows = testIds.map(tid => ({ product_id: pid, test_item_id: tid }))
    const { error: linkErr } = await supabase.from('product_test_items').insert(rows)
    if (linkErr) return res.status(500).json({ success: false, error: linkErr.message })
  }
  res.json({ success: true, id: pid })
})

/**
 * 功能描述：更新产品
 * 参数说明：req.params.id 产品ID；req.body 可更新字段
 * 返回值类型及用途：JSON { success }
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const patch = req.body || {}
  const update: any = {}
  if (patch.product_code) update.product_code = patch.product_code
  if (patch.product_name) update.product_name = patch.product_name
  if (patch.product_type) update.product_type = patch.product_type
  if (patch.status) update.status = patch.status
  const { error } = await supabase.from('products').update(update).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  if (typeof patch.test_item_ids !== 'undefined') {
    await supabase.from('product_test_items').delete().eq('product_id', id)
    const testIds: string[] = (patch.test_item_ids as string[]) || []
    if (testIds.length) {
      const rows = testIds.map(tid => ({ product_id: id, test_item_id: tid }))
      const { error: linkErr } = await supabase.from('product_test_items').insert(rows)
      if (linkErr) return res.status(500).json({ success: false, error: linkErr.message })
    }
  }
  res.json({ success: true })
})

/**
 * 功能描述：批量删除产品
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success, deleted }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('products').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

/**
 * 功能描述：批量启用产品
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success }
 */
router.post('/enable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('products').update({ status: 'enabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量禁用产品
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success }
 */
router.post('/disable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('products').update({ status: 'disabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

export default router

/**
 * 功能描述：获取全部启用的产品名称（供下拉选项）
 * 参数说明：无
 * 返回值类型及用途：JSON { success, data }，包含 id、product_name
 */
router.get('/enabled', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('products')
    .select('id, product_name')
    .eq('status', 'enabled')
    .order('product_name', { ascending: true })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})