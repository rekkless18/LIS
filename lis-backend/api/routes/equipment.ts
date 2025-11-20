import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询设备列表，支持设备号/名称关键词/类型/状态/位置/厂家及日期范围筛选与分页，并聚合负责人姓名
 * 参数说明：
 *  - req.query.deviceNos：逗号分隔设备号列表
 *  - req.query.deviceNameKeyword：名称模糊匹配
 *  - req.query.deviceTypes：中文枚举（测序仪/QPCR仪/离心机/培养箱/生化仪器/质谱仪器/血液仪器/冰箱/其他）
 *  - req.query.statuses：中文枚举（运行/关机/维护/故障/报废）
 *  - req.query.locationKeyword：位置模糊匹配
 *  - req.query.manufacturerKeyword：厂家模糊匹配
 *  - req.query.purchaseStart/purchaseEnd：采购日期范围
 *  - req.query.maintenanceStart/maintenanceEnd：维护日期范围
 *  - req.query.scrapStart/scrapEnd：报废日期范围
 *  - req.query.owners：逗号分隔负责人姓名（中文）
 *  - req.query.pageNo/pageSize：分页参数
 * 返回值类型及用途：
 *  - JSON：{ success, data, total }，data包含 owners（字符串数组）
 */
router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const deviceNos = ((req.query.deviceNos as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const nameKeyword = (req.query.deviceNameKeyword as string) || ''
  const typesCN = ((req.query.deviceTypes as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const statusesCN = ((req.query.statuses as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const locationKw = (req.query.locationKeyword as string) || ''
  const manuKw = (req.query.manufacturerKeyword as string) || ''
  const purchaseStart = (req.query.purchaseStart as string) || ''
  const purchaseEnd = (req.query.purchaseEnd as string) || ''
  const maintenanceStart = (req.query.maintenanceStart as string) || ''
  const maintenanceEnd = (req.query.maintenanceEnd as string) || ''
  const scrapStart = (req.query.scrapStart as string) || ''
  const scrapEnd = (req.query.scrapEnd as string) || ''
  const ownersKw = ((req.query.owners as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
  const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
  const from = (pageNo - 1) * pageSize
  const to = from + pageSize - 1
  const typeMap: Record<string, string> = { '测序仪': 'sequencer', 'QPCR仪': 'qpcr', '离心机': 'centrifuge', '培养箱': 'incubator', '生化仪器': 'biochemical', '质谱仪器': 'mass_spectrometer', '血液仪器': 'hematology', '冰箱': 'refrigerator', '其他': 'other' }
  const statusMap: Record<string, string> = { '运行': 'running', '关机': 'shutdown', '维护': 'maintenance', '故障': 'fault', '报废': 'scrapped' }
  const types = typesCN.map(t => typeMap[t] || t).filter(Boolean)
  const statuses = statusesCN.map(s => statusMap[s] || s).filter(Boolean)
  let q = supabase.from('equipment').select('id,device_code,device_name,device_type,device_status,device_location,manufacturer,purchase_date,last_maintenance_date,scrap_date,created_at', { count: 'exact' })
  if (deviceNos.length) q = q.in('device_code', deviceNos)
  if (nameKeyword) q = q.ilike('device_name', `%${nameKeyword}%`)
  if (types.length) q = q.in('device_type', types)
  if (statuses.length) q = q.in('device_status', statuses)
  if (locationKw) q = q.ilike('device_location', `%${locationKw}%`)
  if (manuKw) q = q.ilike('manufacturer', `%${manuKw}%`)
  if (purchaseStart) q = q.gte('purchase_date', purchaseStart)
  if (purchaseEnd) q = q.lt('purchase_date', purchaseEnd)
  if (maintenanceStart) q = q.gte('last_maintenance_date', maintenanceStart)
  if (maintenanceEnd) q = q.lt('last_maintenance_date', maintenanceEnd)
  if (scrapStart) q = q.gte('scrap_date', scrapStart)
  if (scrapEnd) q = q.lt('scrap_date', scrapEnd)
  const { data, error, count } = await q.order('created_at', { descending: true }).order('device_code', { ascending: true }).range(from, to)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const rows = (data || []).map((r: any) => ({ id: r.id, device_code: r.device_code, device_name: r.device_name, device_type: r.device_type, device_status: r.device_status, device_location: r.device_location, manufacturer: r.manufacturer, purchase_date: r.purchase_date, last_maintenance_date: r.last_maintenance_date, scrap_date: r.scrap_date }))
  const eqIds = rows.map(r => r.id)
  let ownersByEq: Record<string, string[]> = {}
  if (eqIds.length) {
    const { data: links, error: lErr } = await supabase
      .from('equipment_responsibles')
      .select('equipment_id, user_id')
      .in('equipment_id', eqIds)
    if (!lErr && links?.length) {
      const uids = Array.from(new Set(links.map((l: any) => l.user_id)))
      let idToName: Record<string, string> = {}
      if (uids.length) {
        const { data: users, error: uErr } = await supabase.from('users').select('id, name').in('id', uids)
        if (!uErr && users) users.forEach((u: any) => { idToName[u.id] = u.name })
      }
      links.forEach((l: any) => {
        const eid = l.equipment_id as string
        const nm = idToName[l.user_id] || ''
        if (!ownersByEq[eid]) ownersByEq[eid] = []
        if (nm) ownersByEq[eid].push(nm)
      })
    }
  }
  const typeMapRev: Record<string, string> = { 'sequencer': '测序仪', 'qpcr': 'QPCR仪', 'centrifuge': '离心机', 'incubator': '培养箱', 'biochemical': '生化仪器', 'mass_spectrometer': '质谱仪器', 'hematology': '血液仪器', 'refrigerator': '冰箱', 'other': '其他' }
  const statusMapRev: Record<string, string> = { 'running': '运行', 'shutdown': '关机', 'maintenance': '维护', 'fault': '故障', 'scrapped': '报废' }
  let final = rows.map(r => ({
    id: r.id,
    device_code: r.device_code,
    device_name: r.device_name,
    device_type_cn: typeMapRev[r.device_type] || r.device_type,
    status_cn: statusMapRev[r.device_status] || r.device_status,
    device_location: r.device_location,
    manufacturer: r.manufacturer,
    purchase_date: r.purchase_date,
    last_maintenance_date: r.last_maintenance_date,
    scrap_date: r.scrap_date,
    owners: ownersByEq[r.id] || [],
  }))
  if (ownersKw.length) final = final.filter(d => (d.owners || []).some(nm => ownersKw.includes(nm)))
  res.json({ success: true, data: final, total: count || 0 })
})

/**
 * 功能描述：创建设备
 * 参数说明：req.body = { device_code, device_name, device_typeCN, device_statusCN, device_location, manufacturer?, purchase_date?, last_maintenance_date?, scrap_date? }
 * 返回值类型及用途：JSON { success, id }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const typeMap: Record<string, string> = { '测序仪': 'sequencer', 'QPCR仪': 'qpcr', '离心机': 'centrifuge', '培养箱': 'incubator', '生化仪器': 'biochemical', '质谱仪器': 'mass_spectrometer', '血液仪器': 'hematology', '冰箱': 'refrigerator', '其他': 'other' }
  const statusMap: Record<string, string> = { '运行': 'running', '关机': 'shutdown', '维护': 'maintenance', '故障': 'fault', '报废': 'scrapped' }
  const { data, error } = await supabase
    .from('equipment')
    .insert({
      device_code: payload.device_code,
      device_name: payload.device_name,
      device_type: typeMap[payload.device_type] || payload.device_type,
      device_status: statusMap[payload.device_status] || payload.device_status || 'running',
      device_location: payload.device_location,
      manufacturer: payload.manufacturer || null,
      purchase_date: payload.purchase_date || null,
      last_maintenance_date: payload.last_maintenance_date || null,
      scrap_date: payload.scrap_date || null,
    })
    .select('id')
    .single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, id: data?.id })
})

/**
 * 功能描述：更新设备
 * 参数说明：req.params.id 设备ID；req.body 可更新字段（支持中文枚举映射）
 * 返回值类型及用途：JSON { success }
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const patch = req.body || {}
  const update: any = {}
  const typeMap: Record<string, string> = { '测序仪': 'sequencer', 'QPCR仪': 'qpcr', '离心机': 'centrifuge', '培养箱': 'incubator', '生化仪器': 'biochemical', '质谱仪器': 'mass_spectrometer', '血液仪器': 'hematology', '冰箱': 'refrigerator', '其他': 'other' }
  const statusMap: Record<string, string> = { '运行': 'running', '关机': 'shutdown', '维护': 'maintenance', '故障': 'fault', '报废': 'scrapped' }
  if (patch.device_code) update.device_code = patch.device_code
  if (patch.device_name) update.device_name = patch.device_name
  if (patch.device_type) update.device_type = typeMap[patch.device_type] || patch.device_type
  if (patch.device_status) update.device_status = statusMap[patch.device_status] || patch.device_status
  if (patch.device_location) update.device_location = patch.device_location
  if (typeof patch.manufacturer !== 'undefined') update.manufacturer = patch.manufacturer
  if (typeof patch.purchase_date !== 'undefined') update.purchase_date = patch.purchase_date
  if (typeof patch.last_maintenance_date !== 'undefined') update.last_maintenance_date = patch.last_maintenance_date
  if (typeof patch.scrap_date !== 'undefined') update.scrap_date = patch.scrap_date
  const { error } = await supabase.from('equipment').update(update).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量删除设备
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success, deleted }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('equipment').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

export default router