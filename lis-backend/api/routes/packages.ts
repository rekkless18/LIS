import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询套餐列表，支持编码/名称/类型/状态/创建日期范围筛选与分页；返回聚合的产品名称
 * 参数说明：
 *  - req.query.codes：逗号分隔套餐编码列表
 *  - req.query.nameKeyword：名称模糊匹配
 *  - req.query.types：逗号分隔类型（中文枚举）
 *  - req.query.statuses：逗号分隔状态（启用/禁用）
 *  - req.query.createdStart/createdEnd：创建时间范围（ISO字符串）
 *  - req.query.pageNo/pageSize：分页参数
 * 返回值类型及用途：
 *  - JSON：{ success, data, total }；每条记录包含 product_names（字符串数组）
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
  let q = supabase.from('packages').select('id,package_code,package_name,package_type,status,created_at', { count: 'exact' })
  if (codes.length) q = q.in('package_code', codes)
  if (nameKeyword) q = q.ilike('package_name', `%${nameKeyword}%`)
  if (types.length) q = q.in('package_type', types)
  if (statuses.length) q = q.in('status', statuses)
  if (createdStart) q = q.gte('created_at', createdStart)
  if (createdEnd) q = q.lt('created_at', createdEnd)
  const { data, error, count } = await q.order('created_at', { descending: true }).order('package_code', { ascending: true }).range(from, to)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const rows = (data || []).map((r: any) => ({ id: r.id, package_code: r.package_code, package_name: r.package_name, package_type: r.package_type, status: r.status, created_at: r.created_at }))
  const pkgIds = rows.map(r => r.id)
  let productNamesByPkg: Record<string, string[]> = {}
  if (pkgIds.length) {
    // 查询绑定的产品名称
    const { data: links, error: linkErr } = await supabase
      .from('package_products')
      .select('package_id, product_id')
      .in('package_id', pkgIds)
    if (!linkErr && links?.length) {
      const productIds = Array.from(new Set(links.map((l: any) => l.product_id)))
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id, product_name')
        .in('id', productIds)
      const nameMap: Record<string, string> = {}
      if (!prodErr && products) products.forEach((p: any) => { nameMap[p.id] = p.product_name })
      links.forEach((l: any) => {
        const pid = l.package_id as string
        const pname = nameMap[l.product_id] || ''
        if (!productNamesByPkg[pid]) productNamesByPkg[pid] = []
        if (pname) productNamesByPkg[pid].push(pname)
      })
    }
  }
  const final = rows.map(r => ({ ...r, product_names: productNamesByPkg[r.id] || [] }))
  res.json({ success: true, data: final, total: count || 0 })
})

/**
 * 功能描述：创建套餐
 * 参数说明：req.body = { package_code, package_name, package_type, status }
 * 返回值类型及用途：JSON { success, id }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const { data, error } = await supabase.from('packages').insert({
    package_code: payload.package_code,
    package_name: payload.package_name,
    package_type: payload.package_type,
    status: payload.status,
  }).select('id').single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  const pkgId = data?.id as string
  const items: { product_id: string, sample_type: string }[] = (payload.items as any[]) || []
  if (items.length) {
    const rows = items.map(it => ({ package_id: pkgId, product_id: it.product_id, sample_type: it.sample_type }))
    const { error: linkErr } = await supabase.from('package_products').insert(rows)
    if (linkErr) return res.status(500).json({ success: false, error: linkErr.message })
  }
  res.json({ success: true, id: pkgId })
})

/**
 * 功能描述：更新套餐
 * 参数说明：req.params.id 套餐ID；req.body 可更新字段
 * 返回值类型及用途：JSON { success }
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const patch = req.body || {}
  const update: any = {}
  if (patch.package_code) update.package_code = patch.package_code
  if (patch.package_name) update.package_name = patch.package_name
  if (patch.package_type) update.package_type = patch.package_type
  if (patch.status) update.status = patch.status
  const { error } = await supabase.from('packages').update(update).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  if (typeof patch.items !== 'undefined') {
    await supabase.from('package_products').delete().eq('package_id', id)
    const items: { product_id: string, sample_type: string }[] = (patch.items as any[]) || []
    if (items.length) {
      const rows = items.map(it => ({ package_id: id, product_id: it.product_id, sample_type: it.sample_type }))
      const { error: linkErr } = await supabase.from('package_products').insert(rows)
      if (linkErr) return res.status(500).json({ success: false, error: linkErr.message })
    }
  }
  res.json({ success: true })
})

/**
 * 功能描述：批量删除套餐
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success, deleted }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('packages').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

/**
 * 功能描述：批量启用套餐
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success }
 */
router.post('/enable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('packages').update({ status: 'enabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量禁用套餐
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success }
 */
router.post('/disable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('packages').update({ status: 'disabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

export default router