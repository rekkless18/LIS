import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ReportStatus = 'allow' | 'blocked' | 'downloaded'

export interface ReportItem {
  id: string
  reportNo: string
  orderNo: string
  customerName: string
  sampleNos: string[]
  productNames: string[]
  status: ReportStatus
  downloadCount: number
}

export interface ReportFilters {
  reportNos?: string[]
  orderNos?: string[]
  customerNames?: string[]
  sampleNos?: string[]
  productNames?: string[]
  statuses?: ReportStatus[]
  patientName?: string
  patientPhone?: string
  patientId?: string
}

export interface PaginationConfig {
  current: number
  pageSize: number
  total: number
  showSizeChanger: boolean
  pageSizeOptions: string[]
}

interface State {
  list: ReportItem[]
  filtered: ReportItem[]
  selectedRowKeys: string[]
  filters: ReportFilters
  pagination: PaginationConfig
}

interface Actions {
  setList: (list: ReportItem[]) => void
  setFiltered: (list: ReportItem[]) => void
  setSelectedRowKeys: (keys: string[]) => void
  setFilters: (filters: Partial<ReportFilters>) => void
  setPagination: (pagination: Partial<PaginationConfig>) => void
  resetFilters: () => void
  query: () => void
  download: (ids: string[]) => void
}

const defaultFilters: ReportFilters = {
  statuses: ['allow', 'blocked', 'downloaded']
}

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10','20','50','100']
}

const mock: ReportItem[] = [
  { id: 'r1', reportNo: 'RPT202411120001', orderNo: 'ORD202411120001', customerName: '北京协和医院', sampleNos: ['SMP001','SMP002'], productNames: ['全基因组测序'], status: 'allow', downloadCount: 0 },
  { id: 'r2', reportNo: 'RPT202411120002', orderNo: 'ORD202411120002', customerName: '上海瑞金医院', sampleNos: ['SMP010'], productNames: ['外显子组测序'], status: 'blocked', downloadCount: 0 }
]

export const useReportDeliveryStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      list: mock,
      filtered: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,

      setList: (list) => set({ list }),
      setFiltered: (filtered) => set({ filtered }),
      setSelectedRowKeys: (selectedRowKeys) => set({ selectedRowKeys }),
      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      setPagination: (pagination) => set((s) => ({ pagination: { ...s.pagination, ...pagination } })),
      resetFilters: () => set({ filters: defaultFilters }),

      query: () => {
        const { list, filters, pagination } = get()
        let arr = [...list]
        if (filters.reportNos?.length) arr = arr.filter(x => filters.reportNos!.some(n => x.reportNo.includes(n)))
        if (filters.orderNos?.length) arr = arr.filter(x => filters.orderNos!.some(n => x.orderNo.includes(n)))
        if (filters.customerNames?.length) arr = arr.filter(x => filters.customerNames!.some(n => x.customerName.includes(n)))
        if (filters.sampleNos?.length) arr = arr.filter(x => x.sampleNos.some(sn => filters.sampleNos!.some(n => sn.includes(n))))
        if (filters.productNames?.length) arr = arr.filter(x => x.productNames.some(p => filters.productNames!.some(n => p.includes(n))))
        if (filters.statuses?.length) arr = arr.filter(x => filters.statuses!.includes(x.status))
        const start = (pagination.current - 1) * pagination.pageSize
        const end = start + pagination.pageSize
        set({ filtered: arr.slice(start, end), pagination: { ...pagination, total: arr.length } })
      },

      download: (ids) => {
        set(s => ({
          list: s.list.map(x => ids.includes(x.id) ? { ...x, status: 'downloaded', downloadCount: x.downloadCount + 1 } : x),
          selectedRowKeys: []
        }))
      }
    }),
    { name: 'report-delivery-store', partialize: (s) => ({ list: s.list, filters: s.filters, pagination: s.pagination }) }
  )
)

