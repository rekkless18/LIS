import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SampleStatus = 'not_received' | 'received' | 'destroyed' | 'frozen';
export type AbnormalStatus = 'normal' | 'abnormal';

export interface SampleItem {
  id: string;
  orderNo: string;
  sampleNos: string[];
  productNames: string[];
  sampleTypes: string[];
  samplingTime: string;
  status: SampleStatus;
  abnormal: AbnormalStatus;
  storageLocation: string;
  storageBoxId: string;
  receiver: string;
}

export interface SampleFilters {
  orderNos?: string[];
  sampleNos?: string[];
  productIds?: string[];
  statuses?: SampleStatus[];
  abnormal?: AbnormalStatus;
  storageLocation?: string;
  storageBoxIds?: string[];
  receiveRange?: [string, string];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface SampleState {
  list: SampleItem[];
  filtered: SampleItem[];
  selectedRowKeys: string[];
  filters: SampleFilters;
  pagination: PaginationConfig;
  loading: boolean;
}

interface SampleActions {
  setList: (list: SampleItem[]) => void;
  setFiltered: (list: SampleItem[]) => void;
  setSelectedRowKeys: (keys: string[]) => void;
  setFilters: (filters: Partial<SampleFilters>) => void;
  setPagination: (pagination: Partial<PaginationConfig>) => void;
  query: () => void;
  resetFilters: () => void;
  receive: (payload: { waybillNo: string; storageLocation: string; storageBoxId: string; sampleNos: string[] }) => void;
  markAbnormal: (ids: string[], type: 'physical' | 'info', reason: string) => void;
  processAbnormal: (ids: string[], solution: string) => void;
  freeze: (ids: string[], plan: string) => void;
  destroy: (ids: string[], plan: string) => void;
}

const defaultFilters: SampleFilters = {
  statuses: ['not_received', 'received', 'destroyed', 'frozen'],
  abnormal: 'normal'
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useSampleStore = create<SampleState & SampleActions>()(
  persist(
    (set, get) => ({
      list: [],
      filtered: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      loading: false,

      setList: (list) => set({ list }),
      setFiltered: (filtered) => set({ filtered }),
      setSelectedRowKeys: (selectedRowKeys) => set({ selectedRowKeys }),
      setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
      setPagination: (pagination) => set((s) => ({ pagination: { ...s.pagination, ...pagination } })),
      resetFilters: () => set({ filters: defaultFilters }),

      query: () => {
        const { list, filters, pagination } = get();
        let arr = [...list];
        if (filters.orderNos?.length) {
          arr = arr.filter(x => filters.orderNos!.some(n => x.orderNo.includes(n)));
        }
        if (filters.sampleNos?.length) {
          arr = arr.filter(x => x.sampleNos.some(sn => filters.sampleNos!.some(n => sn.includes(n))));
        }
        if (filters.productIds?.length) {
          arr = arr.filter(x => x.productNames.length > 0);
        }
        if (filters.statuses?.length) {
          arr = arr.filter(x => filters.statuses!.includes(x.status));
        }
        if (filters.abnormal) {
          arr = arr.filter(x => x.abnormal === filters.abnormal);
        }
        if (filters.storageLocation) {
          arr = arr.filter(x => x.storageLocation.includes(filters.storageLocation!));
        }
        if (filters.storageBoxIds?.length) {
          arr = arr.filter(x => filters.storageBoxIds!.includes(x.storageBoxId));
        }
        if (filters.receiveRange) {
          const [s, e] = filters.receiveRange;
          arr = arr.filter(x => {
            const d = new Date(x.samplingTime);
            return d >= new Date(s) && d <= new Date(e);
          });
        }
        arr.sort((a, b) => new Date(b.samplingTime).getTime() - new Date(a.samplingTime).getTime());
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        set({ filtered: arr.slice(start, end), pagination: { ...pagination, total: arr.length } });
      },

      receive: ({ waybillNo, storageLocation, storageBoxId, sampleNos }) => {
        const items = sampleNos.map(sn => ({
          id: Date.now().toString() + Math.random(),
          orderNo: 'ORD' + Math.floor(Math.random() * 100000),
          sampleNos: [sn],
          productNames: ['产品A'],
          sampleTypes: ['全血'],
          samplingTime: new Date().toISOString(),
          status: 'received' as SampleStatus,
          abnormal: 'normal' as AbnormalStatus,
          storageLocation,
          storageBoxId,
          receiver: 'admin'
        }));
        set(s => ({ list: [...items, ...s.list] }));
      },
      markAbnormal: (ids) => {
        set(s => ({ list: s.list.map(x => ids.includes(x.id) ? { ...x, abnormal: 'abnormal' } : x) }));
      },
      processAbnormal: (ids) => {
        set(s => ({ list: s.list.map(x => ids.includes(x.id) ? { ...x, abnormal: 'normal' } : x) }));
      },
      freeze: (ids) => {
        set(s => ({ list: s.list.map(x => ids.includes(x.id) ? { ...x, status: 'frozen' } : x) }));
      },
      destroy: (ids) => {
        set(s => ({ list: s.list.map(x => ids.includes(x.id) ? { ...x, status: 'destroyed' } : x) }));
      }
    }),
    { name: 'sample-store', partialize: (s) => ({ list: s.list, filters: s.filters, pagination: s.pagination }) }
  )
);

