import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
let lastPackageController: AbortController | null = null;

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
  packageItems?: { productId: string; sampleType: string }[];
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
      items: [],
      filteredItems: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }),
      resetFilters: () => set({ filters: defaultFilters }),
      /** 函数功能：查询套餐列表并分页；参数：无；返回值：void；用途：调用后端接口并更新状态 */
      query: async () => {
        const { filters, pagination } = get();
        const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
        const params = new URLSearchParams();
        if (filters.codes?.length) params.set('codes', filters.codes.join(','));
        if (filters.nameKeyword) params.set('nameKeyword', filters.nameKeyword);
        if (filters.types?.length && !(filters.types.length === 3)) params.set('types', filters.types.join(','));
        if (filters.statuses?.length && !(filters.statuses.length === 2)) params.set('statuses', filters.statuses.join(','));
        if (filters.createdRange?.[0]) params.set('createdStart', filters.createdRange[0]);
        if (filters.createdRange?.[1]) params.set('createdEnd', filters.createdRange[1]);
        params.set('pageNo', String(pagination.current));
        params.set('pageSize', String(pagination.pageSize));
        try {
          const resp = await fetch(`${API_BASE}/packages?${params.toString()}`);
          if (!resp.ok) { set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } }); return; }
          const json = await resp.json();
          const rows = (json.data || []).map((r: any) => ({
            id: r.id,
            packageCode: r.package_code,
            packageName: r.package_name,
            packageType: r.package_type,
            productNames: r.product_names || [],
            status: r.status === 'enabled' ? '启用' : '禁用',
            createdAt: r.created_at,
          })) as PackageItem[];
          const f = filters;
          const filtered = (f.productNames && f.productNames.length) ? rows.filter(d => d.productNames?.some((n) => f.productNames!.includes(n))) : rows;
          set({ items: rows, filteredItems: filtered, pagination: { ...pagination, total: (json.total || rows.length) } });
        } catch (e: any) { set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } }); }
      },
      /** 函数功能：创建套餐；参数：除id外的套餐对象；返回值：void；用途：调用后端并刷新 */
      createItem: async (it) => {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
        const payload = { package_code: it.packageCode, package_name: it.packageName, package_type: it.packageType, status: it.status === '启用' ? 'enabled' : 'disabled', items: (it.packageItems || []).map(r => ({ product_id: r.productId, sample_type: r.sampleType })) };
        await fetch(`${API_BASE}/packages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：编辑套餐；参数：套餐ID与修改字段；返回值：void；用途：调用后端并刷新 */
      editItem: async (id, patch) => {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
        const payload: any = {};
        if (patch.packageCode) payload.package_code = patch.packageCode;
        if (patch.packageName) payload.package_name = patch.packageName;
        if (patch.packageType) payload.package_type = patch.packageType;
        if (patch.status) payload.status = patch.status === '启用' ? 'enabled' : 'disabled';
        if (patch.packageItems) payload.items = (patch.packageItems || []).map(r => ({ product_id: r.productId, sample_type: r.sampleType }));
        await fetch(`${API_BASE}/packages/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：批量删除套餐；参数：套餐ID数组；返回值：void；用途：调用后端并刷新 */
      deleteItems: async (ids) => {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
        await fetch(`${API_BASE}/packages`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
      /** 函数功能：批量启用套餐；参数：套餐ID数组；返回值：void；用途：调用后端并刷新 */
      enableItems: async (ids) => {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
        await fetch(`${API_BASE}/packages/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
      /** 函数功能：批量禁用套餐；参数：套餐ID数组；返回值：void；用途：调用后端并刷新 */
      disableItems: async (ids) => {
        const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
        await fetch(`${API_BASE}/packages/disable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      }
    }),
    { name: 'package-config-store' }
  )
);

