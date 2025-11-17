/**
 * 功能描述：权限接口路由，提供启用中的权限集合给前端树形组件使用
 * 参数说明：无显式入参；通过请求上下文进行处理
 * 返回值类型及用途：
 *  - GET /api/permissions：返回JSON，字段包含perm_key、perm_name、parent_key、route_path、enabled
 */
import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：获取启用的权限列表
 * 参数说明：
 *  - req：Express Request，请求对象
 *  - res：Express Response，响应对象
 * 返回值类型及用途：
 *  - JSON：{ success: boolean, data: Permission[] }，供前端渲染权限树
 */
router.get('/', async (req: Request, res: Response) => {
  // 功能：若环境未配置，直接返回503；参数：无；返回：JSON错误
  if (!hasSupabaseEnv()) {
    return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  }
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('permissions')
    .select('perm_key,perm_name,parent_key,route_path,enabled')
    .eq('enabled', true)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})

export default router