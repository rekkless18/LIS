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
  /** 函数功能：设置查询条件；参数：部分查询条件；返回值：void；用途：更新filters */
  setFilters: (f: Partial<InventoryFilters>) => void
  /** 函数功能：设置分页配置；参数：部分分页配置；返回值：void；用途：更新分页状态 */
  setPagination: (p: Partial<PaginationConfig>) => void
  /** 函数功能：设置选择行；参数：选中行主键数组；返回值：void；用途：更新选择状态 */
  setSelectedRowKeys: (k: string[]) => void
  /** 函数功能：执行查询；参数：无；返回值：Promise<void>；用途：调用后端接口并更新列表与分页 */
  query: () => Promise<void>
  /** 函数功能：新建物资；参数：物资数据；返回值：Promise<void>；用途：调用后端创建并刷新列表 */
  createItem: (it: Omit<Material, 'id'>) => Promise<void>
  /** 函数功能：编辑物资；参数：物资ID与新数据；返回值：Promise<void>；用途：调用后端更新并刷新列表 */
  editItem: (id: string, patch: Partial<Material>) => Promise<void>
  /** 函数功能：删除物资；参数：物资ID数组；返回值：Promise<void>；用途：调用后端删除并刷新列表 */
  deleteItems: (ids: string[]) => Promise<void>
  resetFilters: () => void
}

const mock: Material[] = []

const defaultFilters: InventoryFilters = {}

const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] }

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api'
let lastController: AbortController | null = null

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
      /** 函数功能：执行查询；参数：无；返回值：Promise<void>；用途：调用后端接口并更新列表与分页 */
      query: async () => {
        const { filters, pagination } = get()
        if (lastController) lastController.abort()
        lastController = new AbortController()
        const params = new URLSearchParams()
        const FULL_THRESHOLDS: Threshold[] = ['告罄','低','中','高']
        if (filters.materialNos?.length) params.set('materialNos', filters.materialNos.join(','))
        if (filters.materialNameKeyword) params.set('materialNameKeyword', filters.materialNameKeyword)
        if (filters.manufacturerKeyword) params.set('manufacturerKeyword', filters.manufacturerKeyword)
        if (filters.batchNoKeyword) params.set('batchNoKeyword', filters.batchNoKeyword)
        if (filters.createdDate) params.set('createdDate', filters.createdDate)
        if (filters.validPeriodKeyword) params.set('validPeriodKeyword', filters.validPeriodKeyword)
        if (filters.thresholds?.length && !(filters.thresholds.length === FULL_THRESHOLDS.length && filters.thresholds.every(t => FULL_THRESHOLDS.includes(t)))) params.set('thresholds', filters.thresholds.join(','))
        params.set('pageNo', String(pagination.current))
        params.set('pageSize', String(pagination.pageSize))
        try {
          const resp = await fetch(`${API_BASE}/inventory?${params.toString()}`, { signal: lastController.signal })
          if (!resp.ok) {
            set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } })
            return
          }
          const json = await resp.json()
          const rows = (json.data || []).map((r: any) => ({
            id: r.id,
            materialNo: r.material_code,
            materialName: r.material_name,
            manufacturer: r.manufacturer,
            batchNo: r.batch_no,
            createdDate: r.created_at,
            validPeriod: r.expiry_date,
            threshold: r.threshold_cn as Threshold,
            quantity: r.quantity,
          })) as Material[]
          set({ items: rows, filteredItems: rows, pagination: { ...pagination, total: json.total || rows.length } })
        } catch (e: any) {
          if (e?.name === 'AbortError') return
          set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } })
        }
      },
      /** 函数功能：新建物资；参数：物资数据；返回值：Promise<void>；用途：调用后端创建并刷新列表 */
      createItem: async (it) => {
        const payload = {
          material_code: it.materialNo,
          material_name: it.materialName,
          manufacturer: it.manufacturer,
          batch_no: it.batchNo,
          expiry_date: it.validPeriod,
          quantity: it.quantity,
          threshold: it.threshold,
        }
        await fetch(`${API_BASE}/inventory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        await get().query()
      },
      /** 函数功能：编辑物资；参数：物资ID与新数据；返回值：Promise<void>；用途：调用后端更新并刷新列表 */
      editItem: async (id, patch) => {
        const payload: any = {}
        if (patch.materialNo) payload.material_code = patch.materialNo
        if (patch.materialName) payload.material_name = patch.materialName
        if (typeof patch.manufacturer !== 'undefined') payload.manufacturer = patch.manufacturer
        if (typeof patch.batchNo !== 'undefined') payload.batch_no = patch.batchNo
        if (typeof patch.validPeriod !== 'undefined') payload.expiry_date = patch.validPeriod
        if (typeof patch.quantity !== 'undefined') payload.quantity = patch.quantity
        if (patch.threshold) payload.threshold = patch.threshold
        await fetch(`${API_BASE}/inventory/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        await get().query()
      },
      /** 函数功能：删除物资；参数：物资ID数组；返回值：Promise<void>；用途：调用后端删除并刷新列表 */
      deleteItems: async (ids) => {
        await fetch(`${API_BASE}/inventory`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) })
        set({ selectedRowKeys: [] })
        await get().query()
      }
    }),
    { name: 'inventory-store' }
  )
)

