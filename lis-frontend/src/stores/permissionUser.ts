import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserType = '内部用户' | '外部用户'
export type EnableStatus = '启用' | '禁用'

export interface UserItem {
  id: string
  account: string
  name: string
  userType: UserType
  status: EnableStatus
  roles: string[]
  email?: string
  phone?: string
  lastLoginTime?: string
  lastPasswordChange?: string
  createdAt?: string
  /** 字段用途：逗号分隔的角色ID集合（来自后端 users.role_ids_str，同步于 user_roles），用于前端回显与兜底映射 */
  roleIdsStr?: string
}

export interface UserFilters {
  accounts?: string[]
  nameKeyword?: string
  userTypes?: UserType[]
  statuses?: EnableStatus[]
  lastLoginRange?: [string, string]
  lastPwdChangeRange?: [string, string]
  createdRange?: [string, string]
}

export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  showSizeChanger: boolean
  pageSizeOptions: string[]
}

interface State {
  items: UserItem[]
  filteredItems: UserItem[]
  selectedRowKeys: string[]
  filters: UserFilters
  pagination: PaginationConfig
}

interface Actions {
  /** 函数功能：设置查询条件；参数：部分查询条件；返回值：void；用途：更新filters */
  setFilters: (f: Partial<UserFilters>) => void
  /** 函数功能：设置分页配置；参数：部分分页配置；返回值：void；用途：更新分页状态 */
  setPagination: (p: Partial<PaginationConfig>) => void
  /** 函数功能：设置选中行；参数：选中主键数组；返回值：void；用途：更新选中状态 */
  setSelectedRowKeys: (k: string[]) => void
  /** 函数功能：执行查询；参数：无；返回值：void；用途：按filters过滤并分页 */
  query: () => void
  /** 函数功能：新建用户；参数：用户数据；返回值：void；用途：添加记录并刷新 */
  createItem: (it: Omit<UserItem, 'id'>) => void
  /** 函数功能：编辑用户；参数：ID与补丁；返回值：void；用途：更新记录并刷新 */
  editItem: (id: string, patch: Partial<UserItem>) => void
  /** 函数功能：删除用户；参数：ID数组；返回值：void；用途：删除记录并刷新 */
  deleteItems: (ids: string[]) => void
  /** 函数功能：启用用户；参数：ID数组；返回值：void；用途：批量启用 */
  enableItems: (ids: string[]) => void
  /** 函数功能：禁用用户；参数：ID数组；返回值：void；用途：批量禁用 */
  disableItems: (ids: string[]) => void
  /** 函数功能：配置角色；参数：ID与角色数组；返回值：void；用途：更新绑定角色 */
  setRoles: (id: string, roles: string[]) => void
  /** 函数功能：重置密码；参数：ID；返回值：新密码字符串；用途：生成随机密码并更新最后修改时间 */
  resetPassword: (id: string) => string
  resetFilters: () => void
}

const mock: UserItem[] = []

const defaultFilters: UserFilters = { userTypes: ['内部用户','外部用户'], statuses: ['启用','禁用'] }
const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] }

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'

export const useUserConfigStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: mock,
      filteredItems: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      /** 函数功能：设置查询条件；参数：部分查询条件；返回值：void；用途：更新filters */
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      /** 函数功能：设置分页配置；参数：部分分页配置；返回值：void；用途：更新分页状态 */
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
      /** 函数功能：设置选中行；参数：选中主键数组；返回值：void；用途：更新选中状态 */
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }),
      resetFilters: () => set({ filters: defaultFilters }),
      /** 函数功能：执行查询；参数：无；返回值：void；用途：请求后端并按filters过滤、分页 */
      query: async () => {
        const { filters, pagination } = get()
        const resp = await fetch(`${API_BASE}/users`)
        const json = await resp.json()
        const rows = (json.data || []).map((u: any) => ({
          id: u.id,
          account: u.account,
          name: u.name,
          userType: u.user_type === 'internal' ? '内部用户' : '外部用户',
          status: u.status === 'enabled' ? '启用' : '禁用',
          roles: (u.roles || []) as string[],
          email: u.email || undefined,
          phone: u.phone || undefined,
          lastLoginTime: u.last_login_at || undefined,
          lastPasswordChange: u.last_password_change_at || undefined,
          createdAt: u.created_at || undefined,
          roleIdsStr: u.role_ids_str || undefined,
        })) as UserItem[]
        let list = [...rows]
        if (filters.accounts?.length) list = list.filter(d => filters.accounts!.some(a => d.account.includes(a)))
        if (filters.nameKeyword) list = list.filter(d => d.name.includes(filters.nameKeyword!))
        if (filters.userTypes?.length) list = list.filter(d => filters.userTypes!.includes(d.userType))
        if (filters.statuses?.length) list = list.filter(d => filters.statuses!.includes(d.status))
        const inRange = (iso?: string, range?: [string,string]) => (iso && range) ? (new Date(iso) >= new Date(range[0]) && new Date(iso) <= new Date(range[1])) : false
        if (filters.lastLoginRange) list = list.filter(d => inRange(d.lastLoginTime, filters.lastLoginRange))
        if (filters.lastPwdChangeRange) list = list.filter(d => inRange(d.lastPasswordChange, filters.lastPwdChangeRange))
        if (filters.createdRange) list = list.filter(d => inRange(d.createdAt, filters.createdRange))
        const startIdx = (pagination.current - 1) * pagination.pageSize
        const page = list.slice(startIdx, startIdx + pagination.pageSize)
        set({ items: rows, filteredItems: page, pagination: { ...pagination, total: list.length } })
      },
      /** 函数功能：新建用户；参数：用户数据；返回值：void；用途：调用后端添加并刷新 */
      createItem: async (it) => {
        const payload = { account: it.account, name: it.name, user_type: it.userType === '内部用户' ? 'internal' : 'external', status: it.status === '启用' ? 'enabled' : 'disabled', email: it.email, phone: it.phone }
        const resp = await fetch(`${API_BASE}/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        const json = await resp.json()
        const newId = json.id as string
        if (it.roles?.length) {
          // 将角色名称映射为角色ID后保存绑定关系
          const roleResp = await fetch(`${API_BASE}/roles`)
          const roleJson = await roleResp.json()
          const roleMap: Record<string, string> = {}
          (roleJson.data || []).forEach((r: any) => { roleMap[r.role_name] = r.id })
          const roleIds = it.roles.map((name) => roleMap[name]).filter(Boolean)
          if (roleIds.length) await fetch(`${API_BASE}/users/${newId}/roles`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role_ids: roleIds }) })
        }
        await get().query()
      },
      /** 函数功能：编辑用户；参数：ID与补丁；返回值：void；用途：调用后端更新并刷新 */
      editItem: async (id, patch) => {
        const payload: any = {}
        if (patch.account) payload.account = patch.account
        if (patch.name) payload.name = patch.name
        if (patch.userType) payload.user_type = patch.userType === '内部用户' ? 'internal' : 'external'
        if (patch.status) payload.status = patch.status === '启用' ? 'enabled' : 'disabled'
        if (patch.email) payload.email = patch.email
        if (patch.phone) payload.phone = patch.phone
        await fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        if (patch.roles) {
          const roleResp = await fetch(`${API_BASE}/roles`)
          const roleJson = await roleResp.json()
          const roleMap: Record<string, string> = {}
          (roleJson.data || []).forEach((r: any) => { roleMap[r.role_name] = r.id })
          const roleIds = patch.roles.map((name) => roleMap[name]).filter(Boolean)
          await fetch(`${API_BASE}/users/${id}/roles`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role_ids: roleIds }) })
        }
        await get().query()
      },
      /** 函数功能：删除用户；参数：ID数组；返回值：void；用途：调用后端删除并刷新 */
      deleteItems: async (ids) => {
        await fetch(`${API_BASE}/users`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
        set({ selectedRowKeys: [] })
        await get().query()
      },
      /** 函数功能：启用用户；参数：ID数组；返回值：void；用途：批量更新状态为启用并刷新 */
      enableItems: async (ids) => {
        await Promise.all(ids.map(id => fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'enabled' }) })))
        set({ selectedRowKeys: [] })
        await get().query()
      },
      /** 函数功能：禁用用户；参数：ID数组；返回值：void；用途：批量更新状态为禁用并刷新 */
      disableItems: async (ids) => {
        await Promise.all(ids.map(id => fetch(`${API_BASE}/users/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'disabled' }) })))
        set({ selectedRowKeys: [] })
        await get().query()
      },
      /** 函数功能：配置绑定角色；参数：用户ID与角色ID数组；返回值：void；用途：保存到后端 */
      setRoles: async (id, roles) => {
        // 功能：提交绑定关系到后端；参数roles视为角色ID数组
        const roleIds: string[] = Array.isArray(roles) ? roles : []
        await fetch(`${API_BASE}/users/${id}/roles`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role_ids: roleIds }) })
      },
      /** 函数功能：重置密码；参数：用户ID；返回值：新密码字符串；用途：将密码重置为 {account}123456 并刷新列表 */
      resetPassword: async (id) => {
        const it = get().items.find(u => u.id === id)
        const account = it?.account || 'user'
        const pwd = `${account}123456`
        await fetch(`${API_BASE}/users/${id}/reset-password`, { method: 'POST' })
        const runQuery = (get() as any).query
        if (typeof runQuery === 'function') await runQuery()
        return pwd
      }
    }),
    { name: 'user-config-store' }
  )
)

