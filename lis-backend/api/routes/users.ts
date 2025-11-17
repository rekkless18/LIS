/**
 * 功能描述：用户管理接口路由，提供用户的查询、创建、更新、删除及角色绑定的API
 * 参数说明：通过请求体或路径参数获取业务参数
 * 返回值类型及用途：统一返回JSON结构，用于前端用户配置页面的数据绑定与交互
 */
import { Router, Request, Response } from 'express'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'
import crypto from 'crypto'

const router = Router()

/**
 * 功能描述：查询用户列表及其绑定的角色名称
 * 参数说明：无
 * 返回值类型及用途：JSON：{ success, data }，data为用户数组，包含角色名称列表
 */
router.get('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { data: users, error: e1 } = await supabase
    .from('users')
    .select('id,account,name,user_type,status,last_login_at,last_password_change_at,created_at,role_ids_str')
  if (e1) return res.status(500).json({ success: false, error: e1.message })
  const userIds = (users || []).map((u: any) => u.id)
  let rolesByUser: Record<string, string[]> = {}
  if (userIds.length) {
    // 功能：优先尝试关联查询；若结果为空，则回退为两步查询聚合中文名称
    const { data: ur, error: e2 } = await supabase
      .from('user_roles')
      .select('user_id,role_id,roles:role_id(role_name)')
      .in('user_id', userIds)
    if (e2) return res.status(500).json({ success: false, error: e2.message })
    if (ur && ur.length > 0) {
      (ur || []).forEach((r: any) => {
        const uid = r.user_id
        const name = r.roles?.role_name as string | undefined
        if (!rolesByUser[uid]) rolesByUser[uid] = []
        if (name) rolesByUser[uid].push(name)
      })
    } else {
      // 回退：查出所有角色ID并查 roles 表映射为中文名后按用户聚合
      const { data: ur2, error: e2b } = await supabase
        .from('user_roles')
        .select('user_id,role_id')
        .in('user_id', userIds)
      if (e2b) return res.status(500).json({ success: false, error: e2b.message })
      const roleIds = Array.from(new Set((ur2 || []).map((r: any) => r.role_id)))
      let idToName: Record<string, string> = {}
      if (roleIds.length) {
        const { data: roles, error: e3 } = await supabase
          .from('roles')
          .select('id,role_name')
          .in('id', roleIds)
        if (e3) return res.status(500).json({ success: false, error: e3.message })
        (roles || []).forEach((r: any) => { idToName[r.id] = r.role_name })
      }
      (ur2 || []).forEach((r: any) => {
        const uid = r.user_id
        const name = idToName[r.role_id]
        if (!rolesByUser[uid]) rolesByUser[uid] = []
        if (name) rolesByUser[uid].push(name)
      })
    }
  }
  const rows = (users || []).map((u: any) => ({
    id: u.id,
    account: u.account,
    name: u.name,
    user_type: u.user_type,
    status: u.status,
    last_login_at: u.last_login_at,
    last_password_change_at: u.last_password_change_at,
    created_at: u.created_at,
    role_ids_str: u.role_ids_str,
    roles: rolesByUser[u.id] || [],
  }))
  res.json({ success: true, data: rows })
})

/**
 * 功能描述：创建用户
 * 参数说明：req.body：{ account,name,user_type,status }
 * 返回值类型及用途：JSON：{ success, id }
 */
router.post('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { account, name, user_type, status, email, phone } = req.body
  const { data, error } = await supabase
    .from('users')
    .insert([{ account, name, user_type, status, email, phone }])
    .select('id')
    .single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  // 功能：为新用户创建默认密码（{account}123456）并写入凭据表
  const defaultPlain = `${account}123456`
  const hashed = makeHashFromPlain(defaultPlain)
  const { error: credErr } = await supabase
    .from('user_credentials')
    .insert([{ user_id: data.id, account, password_hash: hashed.hash, password_algo: hashed.algo, password_status: 'active', last_password_change_at: new Date().toISOString() }])
  if (credErr) return res.status(500).json({ success: false, error: credErr.message })
  res.json({ success: true, id: data.id })
})

/**
 * 功能描述：更新用户基本信息
 * 参数说明：req.params.id：用户ID；req.body：可选字段（name、user_type、status、last_login_at、last_password_change_at）
 * 返回值类型及用途：JSON：{ success }
 */
router.put('/:id', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { id } = req.params
  const patch = req.body
  const { error } = await supabase.from('users').update(patch).eq('id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：批量删除用户
 * 参数说明：req.body.ids：字符串数组，用户ID集合
 * 返回值类型及用途：JSON：{ success }
 */
router.delete('/', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { ids } = req.body as { ids: string[] }
  if (!ids?.length) return res.status(400).json({ success: false, error: 'ids required' })
  const { error } = await supabase.from('users').delete().in('id', ids)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

/**
 * 功能描述：获取指定用户已绑定的角色ID集合
 * 参数说明：req.params.id：用户ID
 * 返回值类型及用途：JSON：{ success, data }，data为角色ID数组
 */
router.get('/:id/roles', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { id } = req.params
  const { data, error } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  const roleIds = (data || []).map((r: any) => r.role_id)
  res.json({ success: true, data: roleIds })
})

/**
 * 功能描述：设置指定用户绑定的角色（重置并写入）
 * 参数说明：req.params.id：用户ID；req.body.role_ids：角色ID数组
 * 返回值类型及用途：JSON：{ success }
 */
router.put('/:id/roles', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { id } = req.params
  const { role_ids } = req.body as { role_ids: string[] }
  const { error: e1 } = await supabase.from('user_roles').delete().eq('user_id', id)
  if (e1) return res.status(500).json({ success: false, error: e1.message })
  if (role_ids?.length) {
    const rows = role_ids.map((rid: string) => ({ user_id: id, role_id: rid }))
    const { error: e2 } = await supabase.from('user_roles').insert(rows)
    if (e2) return res.status(500).json({ success: false, error: e2.message })
  }
  res.json({ success: true })
})

/**
 * 功能描述：重置用户密码（占位实现，仅更新时间戳）
 * 参数说明：req.params.id：用户ID
 * 返回值类型及用途：JSON：{ success }；后续可接入Supabase Auth实现真正密码重置
 */
router.post('/:id/reset-password', async (req: Request, res: Response) => {
  if (!hasSupabaseEnv()) return res.status(503).json({ success: false, error: 'Supabase 未配置' })
  const supabase = getSupabase()
  const { id } = req.params
  // 功能：查询用户账号以生成默认重置密码（{account}123456）
  const { data: userRow, error: e0 } = await supabase.from('users').select('account').eq('id', id).single()
  if (e0) return res.status(500).json({ success: false, error: e0.message })
  const newPlain = `${userRow.account}123456`
  const hashed = makeHashFromPlain(newPlain)
  // 功能：更新或插入 user_credentials 中的密码哈希
  const { data: credExist, error: e1 } = await supabase.from('user_credentials').select('id').eq('user_id', id).maybeSingle()
  if (e1) return res.status(500).json({ success: false, error: e1.message })
  if (credExist?.id) {
    const { error: u1 } = await supabase
      .from('user_credentials')
      .update({ password_hash: hashed.hash, password_algo: hashed.algo, password_status: 'active', last_password_change_at: new Date().toISOString() })
      .eq('id', credExist.id)
    if (u1) return res.status(500).json({ success: false, error: u1.message })
  } else {
    const { error: i1 } = await supabase
      .from('user_credentials')
      .insert([{ user_id: id, account: userRow.account, password_hash: hashed.hash, password_algo: hashed.algo, password_status: 'active', last_password_change_at: new Date().toISOString() }])
    if (i1) return res.status(500).json({ success: false, error: i1.message })
  }
  // 功能：更新 users 中的最后修改密码时间
  const { error: u2 } = await supabase.from('users').update({ last_password_change_at: new Date().toISOString() }).eq('id', id)
  if (u2) return res.status(500).json({ success: false, error: u2.message })
  res.json({ success: true })
})

export default router
/**
 * 功能描述：根据明文密码生成安全哈希（scrypt）
 * 参数说明：
 *  - plain：字符串，明文密码
 * 返回值类型及用途：
 *  - { hash: string, algo: string }：返回哈希值与算法标识，用于存储到 user_credentials
 */
const makeHashFromPlain = (plain: string): { hash: string; algo: string } => {
  const salt = crypto.randomBytes(16).toString('hex')
  const key = crypto.scryptSync(plain, salt, 64).toString('hex')
  return { hash: `scrypt:${salt}:${key}`, algo: 'scrypt' }
}