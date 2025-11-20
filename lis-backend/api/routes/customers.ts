import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询客户列表，支持编码/名称/类型/区域/状态/创建日期范围筛选与分页
 * 参数说明：
 *  - req.query.codes：逗号分隔客户编码列表
 *  - req.query.nameKeyword：名称模糊匹配
 *  - req.query.types：逗号分隔类型（中文枚举：企业客户/高校客户/科研客户）
 *  - req.query.regions：逗号分隔区域（中文枚举：大陆/港澳台/西欧/东南亚/中东/北美/其他）
 *  - req.query.statuses：逗号分隔状态（中文：启用/禁用）
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
  const typesCN = ((req.query.types as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const regionsCN = ((req.query.regions as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const statusesCN = ((req.query.statuses as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const createdStart = (req.query.createdStart as string) || ''
  const createdEnd = (req.query.createdEnd as string) || ''
  const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
  const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
  const from = (pageNo - 1) * pageSize
  const to = from + pageSize - 1
  const typeMap: Record<string, string> = { '企业客户': 'enterprise', '高校客户': 'university', '科研客户': 'research' }
  const regionMap: Record<string, string> = { '大陆': 'mainland', '港澳台': 'hkmotw', '西欧': 'western_europe', '东南亚': 'southeast_asia', '中东': 'middle_east', '北美': 'north_america', '其他': 'other' }
  const statusMap: Record<string, string> = { '启用': 'enabled', '禁用': 'disabled' }
  const types = typesCN.map(t => typeMap[t] || t).filter(Boolean)
  const regions = regionsCN.map(r => regionMap[r] || r).filter(Boolean)
  const statuses = statusesCN.map(s => statusMap[s] || s).filter(Boolean)
  let q = supabase.from('customers').select('id,customer_code,customer_name,customer_type,region,status,created_at', { count: 'exact' })
  if (codes.length) q = q.in('customer_code', codes)
  if (nameKeyword) q = q.ilike('customer_name', `%${nameKeyword}%`)
  if (types.length) q = q.in('customer_type', types)
  if (regions.length) q = q.in('region', regions)
  if (statuses.length) q = q.in('status', statuses)
  if (createdStart) q = q.gte('created_at', createdStart)
  if (createdEnd) q = q.lt('created_at', createdEnd)
  const { data, error, count } = await q.order('created_at', { descending: true }).order('customer_code', { ascending: true }).range(from, to)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const typeMapRev: Record<string, string> = { 'enterprise': '企业客户', 'university': '高校客户', 'research': '科研客户' }
  const regionMapRev: Record<string, string> = { 'mainland': '大陆', 'hkmotw': '港澳台', 'western_europe': '西欧', 'southeast_asia': '东南亚', 'middle_east': '中东', 'north_america': '北美', 'other': '其他' }
  const statusMapRev: Record<string, string> = { 'enabled': '启用', 'disabled': '禁用' }
  const rows = (data || []).map((r: any) => ({
    id: r.id,
    customer_code: r.customer_code,
    customer_name: r.customer_name,
    customer_type: typeMapRev[r.customer_type] || r.customer_type,
    region_cn: regionMapRev[r.region] || r.region,
    status_cn: statusMapRev[r.status] || r.status,
    created_at: r.created_at,
  }))
  res.json({ success: true, data: rows, total: count || 0 })
})

/**
 * 功能描述：创建客户
 * 参数说明：req.body = { customer_code, customer_name, customer_typeCN, regionCN, statusCN }
 * 返回值类型及用途：JSON { success, id }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const typeMap: Record<string, string> = { '企业客户': 'enterprise', '高校客户': 'university', '科研客户': 'research' }
  const regionMap: Record<string, string> = { '大陆': 'mainland', '港澳台': 'hkmotw', '西欧': 'western_europe', '东南亚': 'southeast_asia', '中东': 'middle_east', '北美': 'north_america', '其他': 'other' }
  const statusMap: Record<string, string> = { '启用': 'enabled', '禁用': 'disabled' }
  const { data, error } = await supabase
    .from('customers')
    .insert({
      customer_code: payload.customer_code,
      customer_name: payload.customer_name,
      customer_type: typeMap[payload.customer_type] || payload.customer_type,
      region: regionMap[payload.region] || payload.region,
      status: statusMap[payload.status] || payload.status || 'enabled',
    })
    .select('id')
    .single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, id: data?.id })
})

/**
 * 功能描述：更新客户
 * 参数说明：req.params.id 客户ID；req.body 可更新字段（支持中文枚举映射）
 * 返回值类型及用途：JSON { success }
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const patch = req.body || {}
  const update: any = {}
  const typeMap: Record<string, string> = { '企业客户': 'enterprise', '高校客户': 'university', '科研客户': 'research' }
  const regionMap: Record<string, string> = { '大陆': 'mainland', '港澳台': 'hkmotw', '西欧': 'western_europe', '东南亚': 'southeast_asia', '中东': 'middle_east', '北美': 'north_america', '其他': 'other' }
  const statusMap: Record<string, string> = { '启用': 'enabled', '禁用': 'disabled' }
  if (patch.customer_code) update.customer_code = patch.customer_code
  if (patch.customer_name) update.customer_name = patch.customer_name
  if (patch.customer_type) update.customer_type = typeMap[patch.customer_type] || patch.customer_type
  if (patch.region) update.region = regionMap[patch.region] || patch.region
  if (patch.status) update.status = statusMap[patch.status] || patch.status
  const { error } = await supabase.from('customers').update(update).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量删除客户
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success, deleted }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('customers').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

/**
 * 功能描述：批量启用客户
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success }
 */
router.post('/enable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('customers').update({ status: 'enabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量禁用客户
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success }
 */
router.post('/disable', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error } = await supabase.from('customers').update({ status: 'disabled', updated_at: new Date().toISOString() }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：获取全部启用的客户名称（供下拉选项）
 * 参数说明：无
 * 返回值类型及用途：JSON { success, data }，包含 id、customer_name
 */
router.get('/enabled', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('customers')
    .select('id, customer_name')
    .eq('status', 'enabled')
    .order('customer_name', { ascending: true })
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})

export default router