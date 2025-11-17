import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LogisticsStatus = 'pending' | 'in_transit' | 'delivered' | 'exception';

export interface LogisticsItem {
  id: string;
  waybillNo: string;
  orderNo: string;
  company: string;
  status: LogisticsStatus;
  shippedAt: string;
  author: string;
}

export interface LogisticsFilters {
  waybillNos?: string[];
  orderNos?: string[];
  companies?: string[];
  statuses?: LogisticsStatus[];
  shippedRange?: [string, string];
  authors?: string[];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface LogisticsState {
  list: LogisticsItem[];
  filtered: LogisticsItem[];
  selectedRowKeys: string[];
  filters: LogisticsFilters;
  pagination: PaginationConfig;
  loading: boolean;
  current?: LogisticsItem | null;
}

interface LogisticsActions {
  setList: (list: LogisticsItem[]) => void;
  setFiltered: (list: LogisticsItem[]) => void;
  setSelectedRowKeys: (keys: string[]) => void;
  setFilters: (filters: Partial<LogisticsFilters>) => void;
  setPagination: (pagination: Partial<PaginationConfig>) => void;
  query: () => void;
  resetFilters: () => void;
  create: (item: Omit<LogisticsItem, 'id'>) => LogisticsItem;
  update: (id: string, patch: Partial<LogisticsItem>) => void;
  voidItems: (ids: string[]) => void;
  setCurrent: (item: LogisticsItem | null) => void;
}

const defaultFilters: LogisticsFilters = {
  statuses: ['pending', 'in_transit', 'delivered', 'exception'],
  shippedRange: [
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  ]
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useLogisticsStore = create<LogisticsState & LogisticsActions>()(
  persist(
    (set, get) => ({
      list: [],
      filtered: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      loading: false,
      current: null,

      setList: (list) => set({ list }),
      setFiltered: (filtered) => set({ filtered }),
      setSelectedRowKeys: (selectedRowKeys) => set({ selectedRowKeys }),
      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      setPagination: (pagination) => set((s) => ({ pagination: { ...s.pagination, ...pagination } })),
      setCurrent: (item) => set({ current: item }),
      resetFilters: () => set({ filters: defaultFilters }),

      query: () => {
        const { list, filters, pagination } = get();
        let arr = [...list];
        if (filters.waybillNos?.length) {
          arr = arr.filter(x => filters.waybillNos!.some(n => x.waybillNo.includes(n)));
        }
        if (filters.orderNos?.length) {
          arr = arr.filter(x => filters.orderNos!.some(n => x.orderNo.includes(n)));
        }
        if (filters.companies?.length) {
          arr = arr.filter(x => filters.companies!.includes(x.company));
        }
        if (filters.statuses?.length) {
          arr = arr.filter(x => filters.statuses!.includes(x.status));
        }
        if (filters.shippedRange) {
          const [s, e] = filters.shippedRange;
          arr = arr.filter(x => {
            const d = new Date(x.shippedAt);
            return d >= new Date(s) && d <= new Date(e);
          });
        }
        if (filters.authors?.length) {
          arr = arr.filter(x => filters.authors!.includes(x.author));
        }
        arr.sort((a, b) => new Date(b.shippedAt).getTime() - new Date(a.shippedAt).getTime());
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        set({ filtered: arr.slice(start, end), pagination: { ...pagination, total: arr.length } });
      },

      create: (item) => {
        const created: LogisticsItem = { id: Date.now().toString(), ...item };
        set(s => ({ list: [created, ...s.list] }));
        return created;
      },
      update: (id, patch) => {
        set(s => ({ list: s.list.map(x => x.id === id ? { ...x, ...patch } : x) }));
      },
      voidItems: (ids) => {
        set(s => ({ list: s.list.map(x => ids.includes(x.id) ? { ...x, status: 'exception' } : x), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) }));
      }
    }),
    { name: 'logistics-store', partialize: (s) => ({ list: s.list, filters: s.filters, pagination: s.pagination }) }
  )
);

