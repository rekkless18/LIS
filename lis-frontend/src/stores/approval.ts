import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ApprovalType = '加急申请' | '库存采购申请' | '请假申请'
export type ApprovalStatus = '已审批' | '已通过' | '已驳回'

export interface Approval {
  id: string
  approvalNo: string
  type: ApprovalType
  status: ApprovalStatus
  createdDate?: string
  applicant?: string
  title?: string
  content?: string
}

export interface ApprovalFilters {
  approvalNos?: string[]
  types?: ApprovalType[]
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

const mock: Approval[] = [
  { id: 'a1', approvalNo: 'APR-001', type: '加急申请', status: '已审批', createdDate: new Date().toISOString(), applicant: '张三', title: '订单加急', content: '需要对订单O-1001进行加急处理' },
  { id: 'a2', approvalNo: 'APR-002', type: '库存采购申请', status: '已审批', createdDate: new Date().toISOString(), applicant: '李四', title: '试剂采购', content: '采购试剂A 100瓶' },
  { id: 'a3', approvalNo: 'APR-003', type: '请假申请', status: '已审批', createdDate: new Date().toISOString(), applicant: '王五', title: '事假申请', content: '因家事请假一天' }
]

const defaultFilters: ApprovalFilters = { types: ['加急申请','库存采购申请','请假申请'], statuses: ['已审批','已通过','已驳回'] }

const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] }

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
      query: () => {
        const { items, filters, pagination } = get()
        let list = [...items]
        if (filters.approvalNos?.length) list = list.filter(d => filters.approvalNos!.some(no => d.approvalNo.includes(no)))
        if (filters.types?.length) list = list.filter(d => filters.types!.includes(d.type))
        if (filters.statuses?.length) list = list.filter(d => filters.statuses!.includes(d.status))
        if (filters.createdDate) list = list.filter(d => d.createdDate ? new Date(d.createdDate).toLocaleDateString('zh-CN') === new Date(filters.createdDate!).toLocaleDateString('zh-CN') : false)
        if (filters.applicantKeyword) list = list.filter(d => (d.applicant || '').includes(filters.applicantKeyword!))
        const startIdx = (pagination.current - 1) * pagination.pageSize
        const page = list.slice(startIdx, startIdx + pagination.pageSize)
        set({ filteredItems: page, pagination: { ...pagination, total: list.length } })
      },
      approve: (ids, reason) => {
        set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '已通过', content: reason ? `${d.content} | 理由:${reason}` : d.content } : d), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) }))
      },
      reject: (ids, reason) => {
        set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '已驳回', content: `${d.content} | 理由:${reason}` } : d), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) }))
      }
    }),
    { name: 'approval-store' }
  )
)

