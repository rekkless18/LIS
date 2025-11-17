import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Threshold = '告罄' | '低' | '中' | '高'

export interface Material {
  id: string
  materialNo: string
  materialName: string
  manufacturer: string
  batchNo: string
  createdDate?: string
  validPeriod?: string
  threshold?: Threshold
  quantity?: number
}

export interface InventoryFilters {
  materialNos?: string[]
  materialNameKeyword?: string
  manufacturerKeyword?: string
  batchNoKeyword?: string
  createdDate?: string
  validPeriodKeyword?: string
  thresholds?: Threshold[]
}

export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  showSizeChanger: boolean
  pageSizeOptions: string[]
}

interface State {
  items: Material[]
  filteredItems: Material[]
  selectedRowKeys: string[]
  filters: InventoryFilters
  pagination: PaginationConfig
}

interface Actions {
  setFilters: (f: Partial<InventoryFilters>) => void
  setPagination: (p: Partial<PaginationConfig>) => void
  setSelectedRowKeys: (k: string[]) => void
  query: () => void
  createItem: (it: Omit<Material, 'id'>) => void
  editItem: (id: string, patch: Partial<Material>) => void
  deleteItems: (ids: string[]) => void
  resetFilters: () => void
}

const mock: Material[] = [
  { id: 'm1', materialNo: 'MAT-001', materialName: '试剂A', manufacturer: '厂家甲', batchNo: 'B001', createdDate: new Date().toISOString(), validPeriod: '2026-12-31', threshold: '中', quantity: 120 },
  { id: 'm2', materialNo: 'MAT-002', materialName: '试剂B', manufacturer: '厂家乙', batchNo: 'B007', createdDate: new Date().toISOString(), validPeriod: '2025-06-30', threshold: '低', quantity: 20 },
  { id: 'm3', materialNo: 'MAT-003', materialName: '耗材C', manufacturer: '厂家丙', batchNo: 'C101', createdDate: new Date().toISOString(), validPeriod: '2027-03-15', threshold: '高', quantity: 520 }
]

const defaultFilters: InventoryFilters = { thresholds: ['告罄','低','中','高'] }

const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] }

export const useInventoryStore = create<State & Actions>()(
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
        if (filters.materialNos?.length) list = list.filter(d => filters.materialNos!.some(no => d.materialNo.includes(no)))
        if (filters.materialNameKeyword) list = list.filter(d => d.materialName.includes(filters.materialNameKeyword!))
        if (filters.manufacturerKeyword) list = list.filter(d => d.manufacturer.includes(filters.manufacturerKeyword!))
        if (filters.batchNoKeyword) list = list.filter(d => d.batchNo.includes(filters.batchNoKeyword!))
        if (filters.createdDate) list = list.filter(d => d.createdDate ? new Date(d.createdDate).toLocaleDateString('zh-CN') === new Date(filters.createdDate!).toLocaleDateString('zh-CN') : false)
        if (filters.validPeriodKeyword) list = list.filter(d => (d.validPeriod || '').includes(filters.validPeriodKeyword!))
        if (filters.thresholds?.length) list = list.filter(d => filters.thresholds!.includes(d.threshold as Threshold))
        const startIdx = (pagination.current - 1) * pagination.pageSize
        const page = list.slice(startIdx, startIdx + pagination.pageSize)
        set({ filteredItems: page, pagination: { ...pagination, total: list.length } })
      },
      createItem: (it) => {
        set((s) => ({ items: [{ id: `m${Date.now()}`, ...it }, ...s.items] }))
        get().query()
      },
      editItem: (id, patch) => {
        set((s) => ({ items: s.items.map(d => d.id === id ? { ...d, ...patch } : d) }))
        get().query()
      },
      deleteItems: (ids) => {
        set((s) => ({ items: s.items.filter(d => !ids.includes(d.id)), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) }))
        get().query()
      }
    }),
    { name: 'inventory-store' }
  )
)

