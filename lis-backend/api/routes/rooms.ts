import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询房间列表，支持房间号/位置关键词/状态/防护等级筛选与分页，并聚合最新环境读数
 * 参数说明：
 *  - req.query.roomNos：逗号分隔房间号列表
 *  - req.query.roomLocationKeyword：位置模糊匹配
 *  - req.query.statuses：中文枚举（正常/异常）
 *  - req.query.protectionLevels：中文枚举（一级/二级/三级）
 *  - req.query.pageNo/pageSize：分页参数
 * 返回值类型及用途：
 *  - JSON：{ success, data, total }，data中包含 temperature/humidity/pressure 的最近一次读数
 */
router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const roomNos = ((req.query.roomNos as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const locationKw = (req.query.roomLocationKeyword as string) || ''
  const statusesCN = ((req.query.statuses as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const levelsCN = ((req.query.protectionLevels as string) || '').split(',').map(s => s.trim()).filter(Boolean)
  const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
  const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
  const from = (pageNo - 1) * pageSize
  const to = from + pageSize - 1
  const statusMap: Record<string, string> = { '正常': 'normal', '异常': 'abnormal' }
  const levelMap: Record<string, string> = { '一级': 'level1', '二级': 'level2', '三级': 'level3' }
  const statuses = statusesCN.map(s => statusMap[s] || s).filter(Boolean)
  const levels = levelsCN.map(s => levelMap[s] || s).filter(Boolean)
  let q = supabase.from('rooms').select('id,room_code,room_location,protection_level,status,created_at', { count: 'exact' })
  if (roomNos.length) q = q.in('room_code', roomNos)
  if (locationKw) q = q.ilike('room_location', `%${locationKw}%`)
  if (statuses.length) q = q.in('status', statuses)
  if (levels.length) q = q.in('protection_level', levels)
  const { data, error, count } = await q.order('created_at', { descending: true }).order('room_code', { ascending: true }).range(from, to)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const rows = (data || []).map((r: any) => ({ id: r.id, room_code: r.room_code, room_location: r.room_location, protection_level: r.protection_level, status: r.status }))
  const roomIds = rows.map(r => r.id)
  let latestByRoom: Record<string, { temperature?: number; humidity?: number; pressure?: number }> = {}
  if (roomIds.length) {
    const { data: readings, error: rErr } = await supabase
      .from('environment_readings')
      .select('room_id, temperature, humidity, pressure, reading_at')
      .in('room_id', roomIds)
      .order('reading_at', { descending: true })
    if (!rErr && readings?.length) {
      readings.forEach((rd: any) => {
        const rid = rd.room_id as string
        const prev = latestByRoom[rid]
        if (!prev) latestByRoom[rid] = { temperature: rd.temperature ?? undefined, humidity: rd.humidity ?? undefined, pressure: rd.pressure ?? undefined }
      })
    }
  }
  const statusMapRev: Record<string, string> = { 'normal': '正常', 'abnormal': '异常' }
  const levelMapRev: Record<string, string> = { 'level1': '一级', 'level2': '二级', 'level3': '三级' }
  const final = rows.map(r => ({
    id: r.id,
    room_code: r.room_code,
    room_location: r.room_location,
    protection_level_cn: levelMapRev[r.protection_level] || r.protection_level,
    status_cn: statusMapRev[r.status] || r.status,
    temperature: latestByRoom[r.id]?.temperature,
    humidity: latestByRoom[r.id]?.humidity,
    pressure: latestByRoom[r.id]?.pressure,
  }))
  res.json({ success: true, data: final, total: count || 0 })
})

/**
 * 功能描述：创建房间
 * 参数说明：req.body = { room_code, room_location, protection_levelCN, statusCN }
 * 返回值类型及用途：JSON { success, id }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const levelMap: Record<string, string> = { '一级': 'level1', '二级': 'level2', '三级': 'level3' }
  const statusMap: Record<string, string> = { '正常': 'normal', '异常': 'abnormal' }
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      room_code: payload.room_code,
      room_location: payload.room_location,
      protection_level: levelMap[payload.protection_level] || payload.protection_level,
      status: statusMap[payload.status] || payload.status || 'normal',
    })
    .select('id')
    .single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, id: data?.id })
})

/**
 * 功能描述：更新房间
 * 参数说明：req.params.id 房间ID；req.body 可更新字段（支持中文枚举映射）
 * 返回值类型及用途：JSON { success }
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const id = req.params.id
  const patch = req.body || {}
  const update: any = {}
  const levelMap: Record<string, string> = { '一级': 'level1', '二级': 'level2', '三级': 'level3' }
  const statusMap: Record<string, string> = { '正常': 'normal', '异常': 'abnormal' }
  if (patch.room_code) update.room_code = patch.room_code
  if (patch.room_location) update.room_location = patch.room_location
  if (patch.protection_level) update.protection_level = levelMap[patch.protection_level] || patch.protection_level
  if (patch.status) update.status = statusMap[patch.status] || patch.status
  const { error } = await supabase.from('rooms').update(update).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量删除房间
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success, deleted }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('rooms').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

export default router