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
  /** 函数功能：设置查询条件；参数：部分查询条件；返回值：void；用途：更新filters */
  setFilters: (f: Partial<CustomerFilters>) => void;
  /** 函数功能：设置分页配置；参数：部分分页配置；返回值：void；用途：更新分页状态 */
  setPagination: (p: Partial<PaginationConfig>) => void;
  /** 函数功能：设置选择行；参数：选中行主键数组；返回值：void；用途：更新选择状态 */
  setSelectedRowKeys: (k: string[]) => void;
  /** 函数功能：执行查询；参数：无；返回值：Promise<void>；用途：调用后端接口并更新列表与分页 */
  query: () => Promise<void>;
  /** 函数功能：新建客户；参数：客户数据；返回值：Promise<void>；用途：调用后端创建并刷新列表 */
  createItem: (it: Omit<CustomerItem, 'id'>) => Promise<void>;
  /** 函数功能：编辑客户；参数：客户ID与新数据；返回值：Promise<void>；用途：调用后端更新并刷新列表 */
  editItem: (id: string, patch: Partial<CustomerItem>) => Promise<void>;
  /** 函数功能：删除客户；参数：客户ID数组；返回值：Promise<void>；用途：调用后端删除并刷新列表 */
  deleteItems: (ids: string[]) => Promise<void>;
  /** 函数功能：批量启用客户；参数：客户ID数组；返回值：Promise<void>；用途：调用后端启用并刷新列表 */
  enableItems: (ids: string[]) => Promise<void>;
  /** 函数功能：批量禁用客户；参数：客户ID数组；返回值：Promise<void>；用途：调用后端禁用并刷新列表 */
  disableItems: (ids: string[]) => Promise<void>;
  /** 函数功能：重置筛选条件；参数：无；返回值：void；用途：恢复默认筛选 */
  resetFilters: () => void;
}

const mock: CustomerItem[] = [];

const defaultFilters: CustomerFilters = {} as CustomerFilters;
const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] };

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
let lastController: AbortController | null = null;

export const useCustomerConfigStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      items: mock,
      filteredItems: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      /** 函数功能：设置查询条件；参数：部分查询条件；返回值：void；用途：更新filters */
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      /** 函数功能：设置分页配置；参数：部分分页配置；返回值：void；用途：更新分页状态 */
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
      /** 函数功能：设置选择行；参数：选中行主键数组；返回值：void；用途：更新选择状态 */
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }),
      /** 函数功能：重置筛选条件；参数：无；返回值：void；用途：恢复默认筛选 */
      resetFilters: () => set({ filters: defaultFilters }),
      /** 函数功能：执行查询；参数：无；返回值：Promise<void>；用途：调用后端接口并更新列表与分页 */
      query: async () => {
        const { filters, pagination } = get();
        if (lastController) lastController.abort();
        lastController = new AbortController();
        const params = new URLSearchParams();
        const FULL_TYPES: CustomerType[] = ['企业客户','高校客户','科研客户'];
        const FULL_REGIONS: Region[] = ['大陆','港澳台','西欧','东南亚','中东','北美','其他'];
        const FULL_STATUSES: EnableStatus[] = ['启用','禁用'];
        if (filters.codes?.length) params.set('codes', filters.codes.join(','));
        if (filters.nameKeyword) params.set('nameKeyword', filters.nameKeyword);
        if (filters.types?.length && !(filters.types.length === FULL_TYPES.length && filters.types.every(t => FULL_TYPES.includes(t)))) params.set('types', filters.types.join(','));
        if (filters.regions?.length && !(filters.regions.length === FULL_REGIONS.length && filters.regions.every(r => FULL_REGIONS.includes(r)))) params.set('regions', filters.regions.join(','));
        if (filters.statuses?.length && !(filters.statuses.length === FULL_STATUSES.length && filters.statuses.every(s => FULL_STATUSES.includes(s)))) params.set('statuses', filters.statuses.join(','));
        if (filters.createdRange?.[0]) params.set('createdStart', filters.createdRange[0]);
        if (filters.createdRange?.[1]) params.set('createdEnd', filters.createdRange[1]);
        params.set('pageNo', String(pagination.current));
        params.set('pageSize', String(pagination.pageSize));
        try {
          const resp = await fetch(`${API_BASE}/customers?${params.toString()}`, { signal: lastController.signal });
          if (!resp.ok) {
            set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } });
            return;
          }
          const json = await resp.json();
          const rows = (json.data || []).map((r: any) => ({
            id: r.id,
            customerCode: r.customer_code,
            customerName: r.customer_name,
            customerType: r.customer_type,
            regions: r.region_cn ? [r.region_cn] : [],
            status: r.status_cn,
            createdAt: r.created_at,
          })) as CustomerItem[];
          set({ items: rows, filteredItems: rows, pagination: { ...pagination, total: json.total || rows.length } });
        } catch (e: any) {
          if (e?.name === 'AbortError') return;
          set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } });
        }
      },
      /** 函数功能：新建客户；参数：客户数据；返回值：Promise<void>；用途：调用后端创建并刷新列表 */
      createItem: async (it) => {
        const payload = {
          customer_code: it.customerCode,
          customer_name: it.customerName,
          customer_type: it.customerType,
          region: (it.regions || [])[0],
          status: it.status,
        };
        await fetch(`${API_BASE}/customers`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：编辑客户；参数：客户ID与新数据；返回值：Promise<void>；用途：调用后端更新并刷新列表 */
      editItem: async (id, patch) => {
        const payload: any = {};
        if (patch.customerCode) payload.customer_code = patch.customerCode;
        if (patch.customerName) payload.customer_name = patch.customerName;
        if (patch.customerType) payload.customer_type = patch.customerType;
        if (patch.regions) payload.region = patch.regions[0];
        if (patch.status) payload.status = patch.status;
        await fetch(`${API_BASE}/customers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：删除客户；参数：客户ID数组；返回值：Promise<void>；用途：调用后端删除并刷新列表 */
      deleteItems: async (ids) => {
        await fetch(`${API_BASE}/customers`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
      /** 函数功能：批量启用客户；参数：客户ID数组；返回值：Promise<void>；用途：调用后端启用并刷新列表 */
      enableItems: async (ids) => {
        await fetch(`${API_BASE}/customers/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
      /** 函数功能：批量禁用客户；参数：客户ID数组；返回值：Promise<void>；用途：调用后端禁用并刷新列表 */
      disableItems: async (ids) => {
        await fetch(`${API_BASE}/customers/disable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      }
    }),
    { name: 'customer-config-store' }
  )
);

