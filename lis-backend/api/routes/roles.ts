/**
 * 功能描述：角色管理接口路由，提供角色的查询、创建、更新、删除及权限绑定的API
 * 参数说明：无显式入参；通过请求体或路径参数获取业务参数
 * 返回值类型及用途：
 *  - 统一返回JSON结构，用于前端角色配置页面的数据绑定与交互
 */
import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * 功能描述：查询角色列表
 * 参数说明：
 *  - req：请求对象，无特殊参数
 *  - res：响应对象
 * 返回值类型及用途：
 *  - JSON：{ success, data }，data为角色行数组
 */
router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) {
    return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  }
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('roles')
    .select('id,role_code,role_name,role_type,status,created_at')
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, data })
})

/**
 * 功能描述：创建角色
 * 参数说明：
 *  - req.body.role_code：角色编码
 *  - req.body.role_name：角色名称
 *  - req.body.role_type：角色类型（internal/external）
 *  - req.body.status：角色状态（enabled/disabled）
 * 返回值类型及用途：
 *  - JSON：{ success, id }，返回新建角色的主键ID
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) {
    return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  }
  const supabase = getSupabase()
  const { role_code, role_name, role_type, status } = req.body
  const { data, error } = await supabase.from('roles').insert([{ role_code, role_name, role_type, status }]).select('id').single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, id: data.id })
})

/**
 * 功能描述：更新角色基本信息
 * 参数说明：
 *  - req.params.id：角色ID
 *  - req.body：可选字段（role_code、role_name、role_type、status）
 * 返回值类型及用途：
 *  - JSON：{ success }，成功表示已更新
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) {
    return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  }
  const supabase = getSupabase()
  const { id } = req.params
  const patch = req.body
  const { error } = await supabase.from('roles').update(patch).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量删除角色
 * 参数说明：
 *  - req.body.ids：字符串数组，角色ID集合
 * 返回值类型及用途：
 *  - JSON：{ success }，成功表示已删除
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) {
    return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  }
  const supabase = getSupabase()
  const { ids } = req.body as { ids: string[] }
  if (!ids?.length) return res.status(400).json({ success: false, error: 'ids required' })
  const { error } = await supabase.from('roles').delete().in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：获取角色已绑定的权限键集合
 * 参数说明：
 *  - req.params.id：角色ID
 * 返回值类型及用途：
 *  - JSON：{ success, data }，data为权限键数组（perm_key）
 */
router.get('/:id/permissions', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) {
    return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  }
  const supabase = getSupabase()
  const { id } = req.params
  const { data, error } = await supabase
    .from('role_permissions')
    .select('permission_id,permissions:permission_id(perm_key)')
    .eq('role_id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const keys = (data || []).map((r: any) => r.permissions?.perm_key).filter(Boolean)
  res.json({ success: true, data: keys })
})

/**
 * 功能描述：设置角色的权限绑定（重置并写入）
 * 参数说明：
 *  - req.params.id：角色ID
 *  - req.body.perm_keys：权限键数组（perm_key）
 * 返回值类型及用途：
 *  - JSON：{ success }，成功表示已重建绑定关系
 */
router.put('/:id/permissions', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) {
    return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  }
  const supabase = getSupabase()
  const { id } = req.params
  const { perm_keys } = req.body as { perm_keys: string[] }
  const { data: allPerms, error: e1 } = await supabase.from('permissions').select('id,perm_key').in('perm_key', perm_keys || [])
  if (e1) return res.status(500).json({ success: false, error: e1.message })
  const { error: e2 } = await supabase.from('role_permissions').delete().eq('role_id', id)
  if (e2) return res.status(500).json({ success: false, error: e2.message })
  if (allPerms && allPerms.length) {
    const rows = allPerms.map((p: any) => ({ role_id: id, permission_id: p.id }))
    const { error: e3 } = await supabase.from('role_permissions').insert(rows)
    if (e3) return res.status(500).json({ success: false, error: e3.message })
  }
  res.json({ success: true })
})

export default router