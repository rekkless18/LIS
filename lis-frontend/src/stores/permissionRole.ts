// 功能描述：角色配置状态管理（Zustand），包含查询、增删改、启用禁用、权限绑定；对接后端API与Supabase
// 参数说明：通过各Action函数参数传入；使用环境变量 VITE_API_BASE 指定后端地址
// 返回值类型及用途：导出 Hook（useRoleConfigStore），用于组件读取与更新角色数据
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type RoleType = '内部角色' | '外部角色'
export type EnableStatus = '启用' | '禁用'

export interface RoleItem {
  id: string
  roleCode: string
  roleName: string
  roleType: RoleType
  status: EnableStatus
  boundUserCount: number
  permissions?: string[]
  createdAt?: string
}

export interface RoleFilters {
  codes?: string[]
  nameKeyword?: string
  roleTypes?: RoleType[]
  statuses?: EnableStatus[]
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
  items: RoleItem[]
  filteredItems: RoleItem[]
  selectedRowKeys: string[]
  filters: RoleFilters
  pagination: PaginationConfig
}

interface Actions {
  // 功能：更新筛选条件；参数：部分筛选字段；返回：void
  setFilters: (f: Partial<RoleFilters>) => void
  // 功能：更新分页信息；参数：部分分页字段；返回：void
  setPagination: (p: Partial<PaginationConfig>) => void
  // 功能：更新勾选行；参数：角色ID数组；返回：void
  setSelectedRowKeys: (k: string[]) => void
  // 功能：查询并分页；参数：无；返回：void（内部更新状态）
  query: () => void
  // 功能：创建角色；参数：除id外的角色对象；返回：void（调用后端后刷新）
  createItem: (it: Omit<RoleItem, 'id'>) => void
  // 功能：编辑角色；参数：角色ID与修改字段；返回：void（调用后端后刷新）
  editItem: (id: string, patch: Partial<RoleItem>) => void
  // 功能：批量删除；参数：角色ID数组；返回：void（调用后端后刷新）
  deleteItems: (ids: string[]) => void
  // 功能：批量启用；参数：角色ID数组；返回：void（调用后端后刷新）
  enableItems: (ids: string[]) => void
  // 功能：批量禁用；参数：角色ID数组；返回：void（调用后端后刷新）
  disableItems: (ids: string[]) => void
  // 功能：设置角色权限绑定；参数：角色ID与权限键数组；返回：void（调用后端后刷新）
  setPermissions: (id: string, perms: string[]) => void
  resetFilters: () => void
}

const mock: RoleItem[] = [
  { id: 'r1', roleCode: 'ROLE_ADMIN', roleName: '系统管理员', roleType: '内部角色', status: '启用', boundUserCount: 1, createdAt: new Date().toISOString(), permissions: ['/test','/inventory','/approval','/config','/system'] },
  { id: 'r2', roleCode: 'ROLE_GUEST', roleName: '访客', roleType: '外部角色', status: '禁用', boundUserCount: 1, createdAt: new Date().toISOString(), permissions: ['/report/query'] }
]

const defaultFilters: RoleFilters = { roleTypes: ['内部角色','外部角色'], statuses: ['启用','禁用'] }
const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] }

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'

export const useRoleConfigStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: [],
      filteredItems: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })), // 更新筛选条件
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })), // 更新分页参数
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }), // 更新选中行
      resetFilters: () => set({ filters: defaultFilters }),
      query: async () => {
        // 功能：查询角色列表并进行本地筛选与分页
        const { filters, pagination } = get()
        const resp = await fetch(`${API_BASE}/roles`)
        const json = await resp.json()
        const rows = (json.data || []).map((r: any) => ({
          id: r.id,
          roleCode: r.role_code,
          roleName: r.role_name,
          roleType: r.role_type === 'internal' ? '内部角色' : '外部角色',
          status: r.status === 'enabled' ? '启用' : '禁用',
          boundUserCount: 0,
          createdAt: r.created_at
        })) as RoleItem[]
        let list = [...rows]
        if (filters.codes?.length) list = list.filter(d => filters.codes!.some(c => d.roleCode.includes(c)))
        if (filters.nameKeyword) list = list.filter(d => d.roleName.includes(filters.nameKeyword!))
        if (filters.roleTypes?.length) list = list.filter(d => filters.roleTypes!.includes(d.roleType))
        if (filters.statuses?.length) list = list.filter(d => filters.statuses!.includes(d.status))
        if (filters.createdRange?.[0] && filters.createdRange?.[1]) {
          const [st, et] = filters.createdRange; list = list.filter(d => d.createdAt ? new Date(d.createdAt) >= new Date(st) && new Date(d.createdAt) <= new Date(et) : false)
        }
        const startIdx = (pagination.current - 1) * pagination.pageSize
        const page = list.slice(startIdx, startIdx + pagination.pageSize)
        set({ items: rows, filteredItems: page, pagination: { ...pagination, total: list.length } })
      },
      createItem: async (it) => {
        // 功能：创建角色并刷新
        const payload = { role_code: it.roleCode, role_name: it.roleName, role_type: it.roleType === '内部角色' ? 'internal' : 'external', status: it.status === '启用' ? 'enabled' : 'disabled' }
        await fetch(`${API_BASE}/roles`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        await get().query()
      },
      editItem: async (id, patch) => {
        // 功能：编辑角色并刷新
        const payload: any = {}
        if (patch.roleCode) payload.role_code = patch.roleCode
        if (patch.roleName) payload.role_name = patch.roleName
        if (patch.roleType) payload.role_type = patch.roleType === '内部角色' ? 'internal' : 'external'
        if (patch.status) payload.status = patch.status === '启用' ? 'enabled' : 'disabled'
        await fetch(`${API_BASE}/roles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        await get().query()
      },
      deleteItems: async (ids) => {
        // 功能：批量删除角色并刷新
        await fetch(`${API_BASE}/roles`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
        set({ selectedRowKeys: [] })
        await get().query()
      },
      enableItems: async (ids) => {
        // 功能：批量启用角色并刷新
        await Promise.all(ids.map(id => fetch(`${API_BASE}/roles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'enabled' }) })))
        set({ selectedRowKeys: [] })
        await get().query()
      },
      disableItems: async (ids) => {
        // 功能：批量禁用角色并刷新
        await Promise.all(ids.map(id => fetch(`${API_BASE}/roles/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'disabled' }) })))
        set({ selectedRowKeys: [] })
        await get().query()
      },
      setPermissions: async (id, perms) => {
        // 功能：设置角色权限绑定并刷新
        await fetch(`${API_BASE}/roles/${id}/permissions`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ perm_keys: perms }) })
        await get().query()
      }
    }),
    { name: 'role-config-store' }
  )
)

