import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CustomerType = '企业客户' | '高校客户' | '科研客户';
export type Region = '大陆' | '港澳台' | '西欧' | '东南亚' | '中东' | '北美' | '其他';
export type EnableStatus = '启用' | '禁用';

export interface CustomerItem {
  id: string;
  customerCode: string;
  customerName: string;
  customerType: CustomerType;
  regions: Region[];
  status: EnableStatus;
  createdAt?: string;
}

export interface CustomerFilters {
  codes?: string[];
  nameKeyword?: string;
  types?: CustomerType[];
  regions?: Region[];
  statuses?: EnableStatus[];
  createdRange?: [string, string];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface State {
  items: CustomerItem[];
  filteredItems: CustomerItem[];
  selectedRowKeys: string[];
  filters: CustomerFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setFilters: (f: Partial<CustomerFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  query: () => void;
  createItem: (it: Omit<CustomerItem, 'id'>) => void;
  editItem: (id: string, patch: Partial<CustomerItem>) => void;
  deleteItems: (ids: string[]) => void;
  enableItems: (ids: string[]) => void;
  disableItems: (ids: string[]) => void;
  resetFilters: () => void;
}

const mock: CustomerItem[] = [
  { id: 'cu1', customerCode: 'CU-001', customerName: '华清生物', customerType: '企业客户', regions: ['大陆','北美'], status: '启用', createdAt: new Date().toISOString() },
  { id: 'cu2', customerCode: 'CU-002', customerName: '上江大学实验室', customerType: '高校客户', regions: ['大陆'], status: '禁用', createdAt: new Date().toISOString() }
];

const defaultFilters: CustomerFilters = { types: ['企业客户','高校客户','科研客户'], regions: ['大陆','港澳台','西欧','东南亚','中东','北美','其他'], statuses: ['启用','禁用'] };
const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] };

export const useCustomerConfigStore = create<State & Actions>()(
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
        const { items, filters, pagination } = get();
        let list = [...items];
        if (filters.codes?.length) list = list.filter(d => filters.codes!.some(code => d.customerCode.includes(code)));
        if (filters.nameKeyword) list = list.filter(d => d.customerName.includes(filters.nameKeyword!));
        if (filters.types?.length) list = list.filter(d => filters.types!.includes(d.customerType));
        if (filters.regions?.length) list = list.filter(d => d.regions.some(r => filters.regions!.includes(r)));
        if (filters.statuses?.length) list = list.filter(d => filters.statuses!.includes(d.status));
        if (filters.createdRange?.[0] && filters.createdRange?.[1]) {
          const [st, et] = filters.createdRange; list = list.filter(d => d.createdAt ? new Date(d.createdAt) >= new Date(st) && new Date(d.createdAt) <= new Date(et) : false);
        }
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        set({ filteredItems: page, pagination: { ...pagination, total: list.length } });
      },
      createItem: (it) => { set((s) => ({ items: [{ id: `cu${Date.now()}`, ...it }, ...s.items] })); get().query(); },
      editItem: (id, patch) => { set((s) => ({ items: s.items.map(d => d.id === id ? { ...d, ...patch } : d) })); get().query(); },
      deleteItems: (ids) => { set((s) => ({ items: s.items.filter(d => !ids.includes(d.id)), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) })); get().query(); },
      enableItems: (ids) => { set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '启用' } : d), selectedRowKeys: [] })); get().query(); },
      disableItems: (ids) => { set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '禁用' } : d), selectedRowKeys: [] })); get().query(); }
    }),
    { name: 'customer-config-store' }
  )
);

