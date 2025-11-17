/**
 * 功能描述：创建 Supabase 客户端用于服务端访问数据库（启用RLS策略下的服务端读写）
 * 参数说明：
 *  - 环境变量 SUPABASE_URL：Supabase 项目URL，用于定位后端服务
 *  - 环境变量 SUPABASE_SERVICE_ROLE_KEY：Service Role Key（仅服务端持有），用于在RLS策略下进行管理操作
 * 返回值类型及用途：
 *  - 导出常量 supabase（SupabaseClient 实例），供各API路由访问数据库
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * 功能描述：判断是否已配置Supabase必要环境变量
 * 参数说明：无
 * 返回值类型及用途：boolean，true表示可用，false表示未配置
 */
export const hasSupabaseEnv = (): boolean => {
  const url = process.env.SUPABASE_URL as string
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  return Boolean(url && key)
}

/**
 * 功能描述：延迟创建并获取 Supabase 客户端（避免未配置环境变量时直接抛错）
 * 参数说明：无
 * 返回值类型及用途：SupabaseClient，用于后续CRUD；若未配置则抛出错误
 */
export const getSupabase = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL as string
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string
  const schema = (process.env.SUPABASE_DB_SCHEMA as string) || 'public'
  if (!url || !key) {
    throw new Error('Supabase 未配置（缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY）')
  }
  return createClient(url, key, { auth: { persistSession: false }, db: { schema } })
}