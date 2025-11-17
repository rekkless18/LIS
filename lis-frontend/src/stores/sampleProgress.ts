import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SampleStatus = 'not_received' | 'received' | 'destroyed' | 'frozen';
export type DeliveryStatus = 'not_started' | 'in_lab' | 'reported' | 'delivered';

export interface SampleProgressItem {
  id: string;
  orderId?: string;
  orderType?: 'product' | 'package';
  orderNo: string;
  customerName: string;
  sampleNos: string[];
  productNames: string[];
  packageName?: string;
  sampleTypes: string[];
  samplingTime: string;
  sampleStatus: SampleStatus;
  deliveryStatus: DeliveryStatus;
  orderCreatedAt: string;
  patientName: string;
  patientPhone: string;
  patientId: string;
  createdBy: string;
}

export interface SampleProgressFilters {
  orderNos?: string[];
  customerNames?: string[];
  sampleNos?: string[];
  productNames?: string[];
  sampleStatuses?: SampleStatus[];
  deliveryStatuses?: DeliveryStatus[];
  orderCreatedRange?: [string, string];
  patientName?: string;
  patientPhone?: string;
  patientId?: string;
  createdBy?: string[];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface State {
  list: SampleProgressItem[];
  filtered: SampleProgressItem[];
  selectedRowKeys: string[];
  filters: SampleProgressFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setList: (list: SampleProgressItem[]) => void;
  setFiltered: (list: SampleProgressItem[]) => void;
  setSelectedRowKeys: (keys: string[]) => void;
  setFilters: (filters: Partial<SampleProgressFilters>) => void;
  setPagination: (pagination: Partial<PaginationConfig>) => void;
  resetFilters: () => void;
  query: () => void;
}

const defaultFilters: SampleProgressFilters = {
  sampleStatuses: ['not_received', 'received', 'destroyed', 'frozen'],
  deliveryStatuses: ['not_started', 'in_lab', 'reported', 'delivered'],
  orderCreatedRange: [
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

const mockList: SampleProgressItem[] = [
  {
    id: 'sp1',
    orderId: 'o1',
    orderType: 'product',
    orderNo: 'ORD202411120001',
    customerName: '北京协和医院',
    sampleNos: ['SMP001','SMP002'],
    productNames: ['全基因组测序'],
    packageName: '',
    sampleTypes: ['全血'],
    samplingTime: new Date().toISOString(),
    sampleStatus: 'received',
    deliveryStatus: 'in_lab',
    orderCreatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    patientName: '张三',
    patientPhone: '13812345678',
    patientId: '110101199001011234',
    createdBy: 'admin'
  }
];

export const useSampleProgressStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      list: mockList,
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
        const { list, filters, pagination } = get();
        let arr = [...list];
        if (filters.orderNos?.length) arr = arr.filter(x => filters.orderNos!.some(n => x.orderNo.includes(n)));
        if (filters.customerNames?.length) arr = arr.filter(x => filters.customerNames!.some(n => x.customerName.includes(n)));
        if (filters.sampleNos?.length) arr = arr.filter(x => x.sampleNos.some(sn => filters.sampleNos!.some(n => sn.includes(n))));
        if (filters.productNames?.length) arr = arr.filter(x => x.productNames.some(p => filters.productNames!.some(n => p.includes(n))));
        if (filters.sampleStatuses?.length) arr = arr.filter(x => filters.sampleStatuses!.includes(x.sampleStatus));
        if (filters.deliveryStatuses?.length) arr = arr.filter(x => filters.deliveryStatuses!.includes(x.deliveryStatus));
        if (filters.orderCreatedRange) {
          const [s, e] = filters.orderCreatedRange;
          arr = arr.filter(x => {
            const d = new Date(x.orderCreatedAt);
            return d >= new Date(s) && d <= new Date(e);
          });
        }
        if (filters.patientName) arr = arr.filter(x => x.patientName.toLowerCase().includes(filters.patientName!.toLowerCase()));
        if (filters.patientPhone) arr = arr.filter(x => x.patientPhone === filters.patientPhone);
        if (filters.patientId) arr = arr.filter(x => x.patientId === filters.patientId);
        if (filters.createdBy?.length) arr = arr.filter(x => filters.createdBy!.includes(x.createdBy));
        arr.sort((a,b) => new Date(b.orderCreatedAt).getTime() - new Date(a.orderCreatedAt).getTime());
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        set({ filtered: arr.slice(start, end), pagination: { ...pagination, total: arr.length } });
      }
    }),
    { name: 'sample-progress-store', partialize: (s) => ({ list: s.list, filters: s.filters, pagination: s.pagination }) }
  )
);

