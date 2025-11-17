import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PackageType = '常规套餐' | '科研套餐' | 'VIP套餐';
export type EnableStatus = '启用' | '禁用';

export interface PackageItem {
  id: string;
  packageCode: string;
  packageName: string;
  packageType: PackageType;
  productNames: string[];
  status: EnableStatus;
  createdAt?: string;
}

export interface PackageFilters {
  codes?: string[];
  nameKeyword?: string;
  types?: PackageType[];
  productNames?: string[];
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
  items: PackageItem[];
  filteredItems: PackageItem[];
  selectedRowKeys: string[];
  filters: PackageFilters;
  pagination: PaginationConfig;
}

interface Actions {
  /** 函数功能：设置查询条件；参数：部分查询条件；返回值：void；用途：更新filters */
  setFilters: (f: Partial<PackageFilters>) => void;
  /** 函数功能：设置分页；参数：部分分页配置；返回值：void；用途：更新分页状态 */
  setPagination: (p: Partial<PaginationConfig>) => void;
  /** 函数功能：设置选中行；参数：选中的主键数组；返回值：void；用途：更新选中状态 */
  setSelectedRowKeys: (k: string[]) => void;
  /** 函数功能：执行查询过滤；参数：无；返回值：void；用途：按filters过滤并分页 */
  query: () => void;
  /** 函数功能：新建；参数：新记录；返回值：void；用途：添加记录并刷新 */
  createItem: (it: Omit<PackageItem, 'id'>) => void;
  /** 函数功能：编辑；参数：ID与补丁；返回值：void；用途：更新记录并刷新 */
  editItem: (id: string, patch: Partial<PackageItem>) => void;
  /** 函数功能：删除；参数：ID数组；返回值：void；用途：删除记录并刷新 */
  deleteItems: (ids: string[]) => void;
  /** 函数功能：启用；参数：ID数组；返回值：void；用途：批量启用 */
  enableItems: (ids: string[]) => void;
  /** 函数功能：禁用；参数：ID数组；返回值：void；用途：批量禁用 */
  disableItems: (ids: string[]) => void;
  resetFilters: () => void;
}

const mock: PackageItem[] = [
  { id: 'pk1', packageCode: 'PK-001', packageName: '标准套餐A', packageType: '常规套餐', productNames: ['普检产品A','普检产品B'], status: '启用', createdAt: new Date().toISOString() },
  { id: 'pk2', packageCode: 'PK-002', packageName: '科研套餐B', packageType: '科研套餐', productNames: ['特检产品X'], status: '禁用', createdAt: new Date().toISOString() }
];

const defaultFilters: PackageFilters = { types: ['常规套餐','科研套餐','VIP套餐'], statuses: ['启用','禁用'] };
const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] };

export const usePackageConfigStore = create<State & Actions>()(
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
        if (filters.codes?.length) list = list.filter(d => filters.codes!.some(code => d.packageCode.includes(code)));
        if (filters.nameKeyword) list = list.filter(d => d.packageName.includes(filters.nameKeyword!));
        if (filters.types?.length) list = list.filter(d => filters.types!.includes(d.packageType));
        if (filters.productNames?.length) list = list.filter(d => d.productNames.some(p => filters.productNames!.includes(p)));
        if (filters.statuses?.length) list = list.filter(d => filters.statuses!.includes(d.status));
        if (filters.createdRange?.[0] && filters.createdRange?.[1]) {
          const [st, et] = filters.createdRange; list = list.filter(d => d.createdAt ? new Date(d.createdAt) >= new Date(st) && new Date(d.createdAt) <= new Date(et) : false);
        }
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        set({ filteredItems: page, pagination: { ...pagination, total: list.length } });
      },
      createItem: (it) => { set((s) => ({ items: [{ id: `pk${Date.now()}`, ...it }, ...s.items] })); get().query(); },
      editItem: (id, patch) => { set((s) => ({ items: s.items.map(d => d.id === id ? { ...d, ...patch } : d) })); get().query(); },
      deleteItems: (ids) => { set((s) => ({ items: s.items.filter(d => !ids.includes(d.id)), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) })); get().query(); },
      enableItems: (ids) => { set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '启用' } : d), selectedRowKeys: [] })); get().query(); },
      disableItems: (ids) => { set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '禁用' } : d), selectedRowKeys: [] })); get().query(); }
    }),
    { name: 'package-config-store' }
  )
);

