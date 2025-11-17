/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
/**
 * 功能描述：用户认证接口示例路由（注册、登录、退出），后续可对接Supabase Auth或自建鉴权
 * 参数说明：通过请求体读取账号、密码等字段
 * 返回值类型及用途：统一返回JSON结构，用于前端登录流程
 */
import { Router, type Request, type Response } from 'express'
import crypto from 'crypto'
import { getSupabase, hasSupabaseEnv } from '../supabase.js'

const router = Router()

/**
 * User Login
 * POST /api/auth/register
 * 功能：用户注册；参数：req.body（账号、密码、邮箱等）；返回：JSON（注册结果）
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement register logic
})

/**
 * User Login
 * POST /api/auth/login
 * 功能：用户登录；参数：req.body（账号、密码）；返回：JSON（令牌或会话信息）
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!hasSupabaseEnv()) {
      res.status(503).json({ success: false, error: 'Supabase 未配置' })
      return
    }
    const supabase = getSupabase()
    const account = (req.body?.account || req.body?.username || '').trim()
    const password = (req.body?.password || '').toString()
    if (!account || !password) {
      res.status(400).json({ success: false, error: '账号或密码缺失' })
      return
    }

    const { data: cred, error: credErr } = await supabase
      .from('user_credentials')
      .select('id,user_id,account,password_hash,password_algo,password_status')
      .eq('account', account)
      .maybeSingle()
    if (credErr) {
      res.status(500).json({ success: false, error: credErr.message })
      return
    }
    if (!cred || cred.password_status !== 'active') {
      res.status(401).json({ success: false, error: '账号或密码错误' })
      return
    }
    const hash = cred.password_hash as string
    const parts = hash.split(':')
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      res.status(500).json({ success: false, error: '不支持的密码哈希格式' })
      return
    }
    const salt = parts[1]
    const keyHex = parts[2]
    const derived = crypto.scryptSync(password, salt, 64).toString('hex')
    if (derived !== keyHex) {
      res.status(401).json({ success: false, error: '账号或密码错误' })
      return
    }

    const { data: userRow, error: userErr } = await supabase
      .from('users')
      .select('id,account,name,email,role_ids_str')
      .eq('id', cred.user_id)
      .single()
    if (userErr) {
      res.status(500).json({ success: false, error: userErr.message })
      return
    }

    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userRow.id)

    const token = 'mock-jwt-token-' + Date.now()
    const user = {
      id: String(userRow.id),
      username: userRow.account,
      name: userRow.name || userRow.account,
      email: userRow.email || '',
      avatar: '',
      permissions: [],
      roles: [],
    }
    res.json({ success: true, token, user })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || '服务器错误' })
  }
})

router.post('/change-password', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!hasSupabaseEnv()) {
      res.status(503).json({ success: false, error: 'Supabase 未配置' })
      return
    }
    const supabase = getSupabase()
    const account = (req.body?.account || req.body?.username || '').trim()
    const oldPwd = (req.body?.old_password || '').toString()
    const newPwd = (req.body?.new_password || '').toString()
    if (!account || !oldPwd || !newPwd) {
      res.status(400).json({ success: false, error: '参数缺失' })
      return
    }
    if (newPwd.length < 6 || newPwd.length > 20) {
      res.status(400).json({ success: false, error: '新密码格式错误' })
      return
    }
    const { data: cred, error: credErr } = await supabase
      .from('user_credentials')
      .select('id,user_id,account,password_hash,password_status')
      .eq('account', account)
      .maybeSingle()
    if (credErr) {
      res.status(500).json({ success: false, error: credErr.message })
      return
    }
    if (!cred || cred.password_status !== 'active') {
      res.status(401).json({ success: false, error: '当前密码错误' })
      return
    }
    const parts = String(cred.password_hash).split(':')
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      res.status(500).json({ success: false, error: '不支持的密码哈希格式' })
      return
    }
    const salt = parts[1]
    const keyHex = parts[2]
    const derived = crypto.scryptSync(oldPwd, salt, 64).toString('hex')
    if (derived !== keyHex) {
      res.status(401).json({ success: false, error: '当前密码错误' })
      return
    }
    const newSalt = crypto.randomBytes(16).toString('hex')
    const newKey = crypto.scryptSync(newPwd, newSalt, 64).toString('hex')
    const newHash = `scrypt:${newSalt}:${newKey}`
    const now = new Date().toISOString()
    const { error: u1 } = await supabase
      .from('user_credentials')
      .update({ password_hash: newHash, password_algo: 'scrypt', password_status: 'active', last_password_change_at: now })
      .eq('id', cred.id)
    if (u1) {
      res.status(500).json({ success: false, error: u1.message })
      return
    }
    const { error: u2 } = await supabase
      .from('users')
      .update({ last_password_change_at: now })
      .eq('id', cred.user_id)
    if (u2) {
      res.status(500).json({ success: false, error: u2.message })
      return
    }
    res.json({ success: true })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || '服务器错误' })
  }
})

/**
 * User Logout
 * POST /api/auth/logout
 * 功能：用户退出；参数：req.body（可选）；返回：JSON（退出结果）
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  // TODO: Implement logout logic
})

export default router
