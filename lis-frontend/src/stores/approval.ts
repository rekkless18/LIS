import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useAuthStore } from './auth'

export type ApprovalType = '加急申请' | '库存采购申请' | '请假申请'
export type ApprovalLevel = '一级审批' | '二级审批' | '三级审批'
export type ApprovalStatus = '审批中' | '已通过' | '已驳回' | '已撤回'

export interface Approval {
  id: string
  approvalNo: string
  type: ApprovalType
  flowName: string
  level: ApprovalLevel
  status: ApprovalStatus
  createdDate?: string
  applicant?: string
  nodes?: { label: string; status: ApprovalStatus }[]
  content?: string
}

export interface ApprovalFilters {
  approvalNos?: string[]
  types?: ApprovalType[]
  levels?: ApprovalLevel[]
  statuses?: ApprovalStatus[]
  createdDate?: string
  applicantKeyword?: string
}

export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  showSizeChanger: boolean
  pageSizeOptions: string[]
}

interface State {
  items: Approval[]
  filteredItems: Approval[]
  selectedRowKeys: string[]
  filters: ApprovalFilters
  pagination: PaginationConfig
}

interface Actions {
  setFilters: (f: Partial<ApprovalFilters>) => void
  setPagination: (p: Partial<PaginationConfig>) => void
  setSelectedRowKeys: (k: string[]) => void
  query: () => void
  approve: (ids: string[], reason?: string) => void
  reject: (ids: string[], reason: string) => void
  resetFilters: () => void
}

const mock: Approval[] = []

const defaultFilters: ApprovalFilters = { types: ['加急申请','库存采购申请','请假申请'], levels: ['一级审批','二级审批','三级审批'] }

const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] }

const API_BASE = (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001/api'

export const useApprovalStore = create<State & Actions>()(
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
        if (filters.approvalNos?.length) params.set('approvalNos', filters.approvalNos.join(','))
        if (filters.types?.length) params.set('types', filters.types.join(','))
        if (filters.levels?.length) params.set('levels', filters.levels.join(','))
        if (filters.statuses?.length) params.set('statuses', filters.statuses.join(','))
        if (filters.createdDate) params.set('createdDate', filters.createdDate)
        if (filters.applicantKeyword) params.set('applicantKeyword', filters.applicantKeyword)
        params.set('pageNo', String(pagination.current))
        params.set('pageSize', String(pagination.pageSize))
        const userId = (useAuthStore.getState().user?.id) || ''
        if (userId) params.set('current_user_id', userId)
        const resp = await fetch(`${API_BASE}/approval/requests?${params.toString()}`)
        const json = await resp.json()
        const rows = (json.data || []) as Approval[]
        const startIdx = 0
        const page = rows.slice(startIdx, startIdx + pagination.pageSize)
        set({ items: rows, filteredItems: page, pagination: { ...pagination, total: json.total || rows.length } })
      },
      approve: async (ids, reason) => {
        const operator = (useAuthStore.getState().user?.id) || ''
        await Promise.all(ids.map(id => fetch(`${API_BASE}/approval/requests/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve', reason, operator_id: operator }) })))
        set((s) => ({ selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) }))
        await (get() as any).query()
      },
      reject: async (ids, reason) => {
        const operator = (useAuthStore.getState().user?.id) || ''
        await Promise.all(ids.map(id => fetch(`${API_BASE}/approval/requests/${id}/action`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'reject', reason, operator_id: operator }) })))
        set((s) => ({ selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) }))
        await (get() as any).query()
      }
    }),
    { name: 'approval-store' }
  )
)

