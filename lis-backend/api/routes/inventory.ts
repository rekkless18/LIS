import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询库存物资列表，支持编码/名称关键词/厂家/批次/创建日期/有效期与阈值筛选及分页
 * 参数说明：
 *  - req.query.materialNos：逗号分隔物资编码列表
 *  - req.query.materialNameKeyword：名称模糊匹配
 *  - req.query.manufacturerKeyword：厂家模糊匹配
 *  - req.query.batchNoKeyword：批次号模糊匹配
 *  - req.query.createdDate：创建日期（YYYY-MM-DD或ISO）
 *  - req.query.validPeriodKeyword：有效期（到期日）字符串（YYYY-MM-DD）
 *  - req.query.thresholds：中文枚举（告罄/低/中/高）
 *  - req.query.pageNo/pageSize：分页参数
 * 返回值类型及用途：
 *  - JSON：{ success, data, total }
 */
router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const nos = ((req.query.materialNos as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const nameKw = (req.query.materialNameKeyword as string) || ''
  const manuKw = (req.query.manufacturerKeyword as string) || ''
  const batchKw = (req.query.batchNoKeyword as string) || ''
  const createdDate = (req.query.createdDate as string) || ''
  const validPeriodKeyword = (req.query.validPeriodKeyword as string) || ''
  const thresholdsCN = ((req.query.thresholds as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
  const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
  const from = (pageNo - 1) * pageSize
  const to = from + pageSize - 1
  const thMap: Record<string, string> = { '告罄': 'out', '低': 'low', '中': 'medium', '高': 'high' }
  const ths = thresholdsCN.map(t => thMap[t] || t).filter(Boolean)
  let q = supabase.from('inventory_items').select('id,material_code,material_name,manufacturer,batch_no,expiry_date,created_at,updated_at,quantity,threshold_level', { count: 'exact' })
  if (nos.length) q = q.in('material_code', nos)
  if (nameKw) q = q.ilike('material_name', `%${nameKw}%`)
  if (manuKw) q = q.ilike('manufacturer', `%${manuKw}%`)
  if (batchKw) q = q.ilike('batch_no', `%${batchKw}%`)
  if (createdDate) q = q.gte('created_at', createdDate).lt('created_at', new Date(new Date(createdDate).getTime() + 24 * 60 * 60 * 1000).toISOString())
  if (validPeriodKeyword) q = q.eq('expiry_date', validPeriodKeyword)
  if (ths.length) q = q.in('threshold_level', ths)
  const { data, error, count } = await q.order('created_at', { descending: true }).order('material_code', { ascending: true }).range(from, to)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const thMapRev: Record<string, string> = { 'out': '告罄', 'low': '低', 'medium': '中', 'high': '高' }
  const rows = (data || []).map((r: any) => ({
    id: r.id,
    material_code: r.material_code,
    material_name: r.material_name,
    manufacturer: r.manufacturer,
    batch_no: r.batch_no,
    created_at: r.created_at,
    expiry_date: r.expiry_date,
    threshold_cn: thMapRev[r.threshold_level] || r.threshold_level,
    quantity: r.quantity,
  }))
  res.json({ success: true, data: rows, total: count || 0 })
})

/**
 * 功能描述：创建库存物资记录
 * 参数说明：req.body = { material_code, material_name, manufacturer?, batch_no?, expiry_date?, quantity, thresholdCN }
 * 返回值类型及用途：JSON { success, id }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const thMap: Record<string, string> = { '告罄': 'out', '低': 'low', '中': 'medium', '高': 'high' }
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      material_code: payload.material_code,
      material_name: payload.material_name,
      manufacturer: payload.manufacturer || null,
      batch_no: payload.batch_no || null,
      expiry_date: payload.expiry_date || null,
      quantity: payload.quantity,
      threshold_level: thMap[payload.threshold] || payload.threshold,
    })
    .select('id')
    .single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, id: data?.id })
})

/**
 * 功能描述：更新库存物资记录
 * 参数说明：req.params.id 物资ID；req.body 可更新字段（支持中文枚举映射）
 * 返回值类型及用途：JSON { success }
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const patch = req.body || {}
  const update: any = {}
  const thMap: Record<string, string> = { '告罄': 'out', '低': 'low', '中': 'medium', '高': 'high' }
  if (patch.material_code) update.material_code = patch.material_code
  if (patch.material_name) update.material_name = patch.material_name
  if (typeof patch.manufacturer !== 'undefined') update.manufacturer = patch.manufacturer
  if (typeof patch.batch_no !== 'undefined') update.batch_no = patch.batch_no
  if (typeof patch.expiry_date !== 'undefined') update.expiry_date = patch.expiry_date
  if (typeof patch.quantity !== 'undefined') update.quantity = patch.quantity
  if (patch.threshold) update.threshold_level = thMap[patch.threshold] || patch.threshold
  const { error } = await supabase.from('inventory_items').update(update).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量删除库存物资记录
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success, deleted }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('inventory_items').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

export default router