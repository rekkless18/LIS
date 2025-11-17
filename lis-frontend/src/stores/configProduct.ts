import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ProductType = '普检产品' | '特检产品' | '质谱产品' | '研发产品' | '其他产品';
export type EnableStatus = '启用' | '禁用';

export interface ProductItem {
  id: string;
  productCode: string;
  productName: string;
  productType: ProductType;
  status: EnableStatus;
  testItems: string[];
  createdAt?: string;
}

export interface ProductFilters {
  codes?: string[];
  nameKeyword?: string;
  types?: ProductType[];
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
  items: ProductItem[];
  filteredItems: ProductItem[];
  selectedRowKeys: string[];
  filters: ProductFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setFilters: (f: Partial<ProductFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  query: () => void;
  createItem: (it: Omit<ProductItem, 'id'>) => void;
  editItem: (id: string, patch: Partial<ProductItem>) => void;
  deleteItems: (ids: string[]) => void;
  enableItems: (ids: string[]) => void;
  disableItems: (ids: string[]) => void;
  resetFilters: () => void;
}

const mock: ProductItem[] = [
  { id: 'pd1', productCode: 'PD-001', productName: '普检产品A', productType: '普检产品', status: '启用', testItems: ['检测项X','检测项Y'], createdAt: new Date().toISOString() },
  { id: 'pd2', productCode: 'PD-002', productName: '特检产品B', productType: '特检产品', status: '禁用', testItems: ['检测项Z'], createdAt: new Date().toISOString() }
];

const defaultFilters: ProductFilters = { types: ['普检产品','特检产品','质谱产品','研发产品','其他产品'], statuses: ['启用','禁用'] };
const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] };

export const useProductConfigStore = create<State & Actions>()(
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
        if (filters.codes?.length) list = list.filter(d => filters.codes!.some(code => d.productCode.includes(code)));
        if (filters.nameKeyword) list = list.filter(d => d.productName.includes(filters.nameKeyword!));
        if (filters.types?.length) list = list.filter(d => filters.types!.includes(d.productType));
        if (filters.statuses?.length) list = list.filter(d => filters.statuses!.includes(d.status));
        if (filters.createdRange?.[0] && filters.createdRange?.[1]) {
          const [st, et] = filters.createdRange; list = list.filter(d => d.createdAt ? new Date(d.createdAt) >= new Date(st) && new Date(d.createdAt) <= new Date(et) : false);
        }
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        set({ filteredItems: page, pagination: { ...pagination, total: list.length } });
      },
      createItem: (it) => { set((s) => ({ items: [{ id: `pd${Date.now()}`, ...it }, ...s.items] })); get().query(); },
      editItem: (id, patch) => { set((s) => ({ items: s.items.map(d => d.id === id ? { ...d, ...patch } : d) })); get().query(); },
      deleteItems: (ids) => { set((s) => ({ items: s.items.filter(d => !ids.includes(d.id)), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) })); get().query(); },
      enableItems: (ids) => { set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '启用' } : d), selectedRowKeys: [] })); get().query(); },
      disableItems: (ids) => { set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '禁用' } : d), selectedRowKeys: [] })); get().query(); }
    }),
    { name: 'product-config-store' }
  )
);

