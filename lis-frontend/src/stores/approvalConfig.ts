import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FlowType = '加急申请' | '库存采购申请' | '请假申请'
export type FlowLevel = '一级审批' | '二级审批' | '三级审批'
export type EnableStatus = '启用' | '禁用'
export type ApproverType = '系统角色' | '部门负责人' | '指定用户' | '直接上级' | '间接上级'

export interface FlowNode {
  approverType: ApproverType
  roleName?: string
  department?: string
  userNames?: string[]
}

export interface ApprovalFlow {
  id: string
  flowCode: string
  flowName: string
  flowType: FlowType
  description?: string
  level: FlowLevel
  status: EnableStatus
  createdAt?: string
  nodes: FlowNode[]
}

export interface FlowFilters {
  codes?: string[]
  nameKeyword?: string
  types?: FlowType[]
  levels?: FlowLevel[]
  statuses?: EnableStatus[]
}

export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  showSizeChanger: boolean
  pageSizeOptions: string[]
}

interface State {
  items: ApprovalFlow[]
  filteredItems: ApprovalFlow[]
  selectedRowKeys: string[]
  filters: FlowFilters
  pagination: PaginationConfig
}

interface Actions {
  setFilters: (f: Partial<FlowFilters>) => void
  setPagination: (p: Partial<PaginationConfig>) => void
  setSelectedRowKeys: (k: string[]) => void
  query: () => void
  createFlow: (it: Omit<ApprovalFlow, 'id' | 'createdAt'>) => void
  editFlow: (id: string, patch: Partial<ApprovalFlow>) => void
  deleteFlows: (ids: string[]) => void
  enableFlows: (ids: string[]) => void
  disableFlows: (ids: string[]) => void
  resetFilters: () => void
}

const mock: ApprovalFlow[] = []

const defaultFilters: FlowFilters = {
  types: ['加急申请','库存采购申请','请假申请'],
  levels: ['一级审批','二级审批','三级审批'],
  statuses: ['启用','禁用']
}

const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] }

export const useApprovalConfigStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: mock,
      filteredItems: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }),
      resetFilters: () => set({ filters: defaultFilters }),
      query: async () => {
        const { filters, pagination } = get()
        const params = new URLSearchParams()
        if (filters.codes?.length) params.set('codes', filters.codes.join(','))
        if (filters.nameKeyword) params.set('nameKeyword', filters.nameKeyword)
        if (filters.types?.length) params.set('types', filters.types.join(','))
        if (filters.levels?.length) params.set('levels', filters.levels.join(','))
        if (filters.statuses?.length) params.set('statuses', filters.statuses.join(','))
        params.set('pageNo', String(pagination.current))
        params.set('pageSize', String(pagination.pageSize))
        const base = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
        const resp = await fetch(`${base}/approval/flows?${params.toString()}`)
        const json = await resp.json()
        const rows = (json.data || []) as ApprovalFlow[]
        const startIdx = 0
        const page = rows.slice(startIdx, startIdx + pagination.pageSize)
        set({ items: rows, filteredItems: page, pagination: { ...pagination, total: json.total || rows.length } })
      },
      createFlow: async (it) => {
        const base = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
        const rolesResp = await fetch(`${base}/roles`)
        const rolesJson = await rolesResp.json()
        const roleMap: Record<string, string> = {}
        ;(rolesJson.data || []).forEach((r: any) => { roleMap[r.role_name] = r.id })
        const usersResp = await fetch(`${base}/users`)
        const usersJson = await usersResp.json()
        const userMap: Record<string, string> = {}
        ;(usersJson.data || []).forEach((u: any) => { userMap[u.name] = u.id })
        const payload: any = { ...it }
        payload.nodes = (it.nodes || []).map(n => ({
          approverType: n.approverType,
          department: n.department,
          roleId: n.roleName ? roleMap[n.roleName] : undefined,
          userIds: Array.isArray(n.userNames) ? n.userNames.map(name => userMap[name]).filter(Boolean) : undefined
        }))
        await fetch(`${base}/approval/flows`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        await get().query()
      },
      editFlow: async (id, patch) => {
        const base = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
        const rolesResp = await fetch(`${base}/roles`)
        const rolesJson = await rolesResp.json()
        const roleMap: Record<string, string> = {}
        ;(rolesJson.data || []).forEach((r: any) => { roleMap[r.role_name] = r.id })
        const usersResp = await fetch(`${base}/users`)
        const usersJson = await usersResp.json()
        const userMap: Record<string, string> = {}
        ;(usersJson.data || []).forEach((u: any) => { userMap[u.name] = u.id })
        const payload: any = { ...patch }
        if (payload.nodes) payload.nodes = payload.nodes.map((n: any) => ({
          approverType: n.approverType,
          department: n.department,
          roleId: n.roleName ? roleMap[n.roleName] : undefined,
          userIds: Array.isArray(n.userNames) ? n.userNames.map((name: string) => userMap[name]).filter(Boolean) : undefined
        }))
        await fetch(`${base}/approval/flows/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        await get().query()
      },
      deleteFlows: async (ids) => {
        const base = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
        await fetch(`${base}/approval/flows`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
        set({ selectedRowKeys: [] })
        await get().query()
      },
      enableFlows: async (ids) => {
        const base = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
        await fetch(`${base}/approval/flows/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
        set({ selectedRowKeys: [] })
        await get().query()
      },
      disableFlows: async (ids) => {
        const base = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'
        await fetch(`${base}/approval/flows/disable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
        set({ selectedRowKeys: [] })
        await get().query()
      }
    }),
    { name: 'approval-config-store' }
  )
)