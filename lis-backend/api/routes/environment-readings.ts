import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询环境读数，支持房间ID与时间范围筛选与分页
 * 参数说明：
 *  - req.query.roomId：房间ID
 *  - req.query.start/end：时间范围（ISO字符串，用于 reading_at）
 *  - req.query.pageNo/pageSize：分页参数
 * 返回值类型及用途：
 *  - JSON：{ success, data, total }
 */
router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const roomId = (req.query.roomId as string) || ''
  const start = (req.query.start as string) || ''
  const end = (req.query.end as string) || ''
  const pageNo = parseInt((req.query.pageNo as string) || '1', 10)
  const pageSize = parseInt((req.query.pageSize as string) || '20', 10)
  const from = (pageNo - 1) * pageSize
  const to = from + pageSize - 1
  let q = supabase.from('environment_readings').select('id,room_id,temperature,humidity,pressure,reading_at,created_at', { count: 'exact' })
  if (roomId) q = q.eq('room_id', roomId)
  if (start) q = q.gte('reading_at', start)
  if (end) q = q.lt('reading_at', end)
  const { data, error, count } = await q.order('reading_at', { descending: true }).range(from, to)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data, total: count || 0 })
})

/**
 * 功能描述：创建环境读数
 * 参数说明：req.body = { room_id, temperature?, humidity?, pressure?, reading_at }
 * 返回值类型及用途：JSON { success, id }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const payload = req.body || {}
  const { data, error } = await supabase
    .from('environment_readings')
    .insert({
      room_id: payload.room_id,
      temperature: typeof payload.temperature !== 'undefined' ? payload.temperature : null,
      humidity: typeof payload.humidity !== 'undefined' ? payload.humidity : null,
      pressure: typeof payload.pressure !== 'undefined' ? payload.pressure : null,
      reading_at: payload.reading_at,
    })
    .select('id')
    .single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, id: data?.id })
})

/**
 * 功能描述：删除环境读数（批量）
 * 参数说明：req.body.ids ID数组
 * 返回值类型及用途：JSON { success, deleted }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const ids: string[] = (req.body?.ids as string[]) || []
  const { error, count } = await supabase.from('environment_readings').delete({ count: 'exact' }).in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, deleted: count || 0 })
})

export default router