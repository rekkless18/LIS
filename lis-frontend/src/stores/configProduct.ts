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
  testItemIds?: string[];
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

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
let lastProductController: AbortController | null = null;

export const useProductConfigStore = create<State & Actions>()(
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
      /** 函数功能：查询产品列表并分页；参数：无；返回值：void；用途：调用后端接口并更新状态 */
      query: async () => {
        const { filters, pagination } = get();
        if (lastProductController) lastProductController.abort();
        lastProductController = new AbortController();
        const params = new URLSearchParams();
        if (filters.codes?.length) params.set('codes', filters.codes.join(','));
        if (filters.nameKeyword) params.set('nameKeyword', filters.nameKeyword);
        if (filters.types?.length && !(filters.types.length === 5)) params.set('types', filters.types.join(','));
        if (filters.statuses?.length && !(filters.statuses.length === 2)) params.set('statuses', filters.statuses.join(','));
        if (filters.createdRange?.[0]) params.set('createdStart', filters.createdRange[0]);
        if (filters.createdRange?.[1]) params.set('createdEnd', filters.createdRange[1]);
        params.set('pageNo', String(pagination.current));
        params.set('pageSize', String(pagination.pageSize));
        try {
          const resp = await fetch(`${API_BASE}/products?${params.toString()}`, { signal: lastProductController.signal });
          if (!resp.ok) { set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } }); return; }
          const json = await resp.json();
          const rows = (json.data || []).map((r: any) => ({
            id: r.id,
            productCode: r.product_code,
            productName: r.product_name,
            productType: r.product_type,
            status: r.status === 'enabled' ? '启用' : '禁用',
            testItems: r.test_item_names || [],
            testItemIds: r.test_item_ids || [],
            createdAt: r.created_at
          })) as ProductItem[];
          set({ items: rows, filteredItems: rows, pagination: { ...pagination, total: json.total || rows.length } });
        } catch (e: any) { if (e?.name !== 'AbortError') set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } }); }
      },
      /** 函数功能：创建产品；参数：除id外的产品对象；返回值：void；用途：调用后端并刷新 */
      createItem: async (it) => {
        const payload = { product_code: it.productCode, product_name: it.productName, product_type: it.productType, status: it.status === '启用' ? 'enabled' : 'disabled', test_item_ids: it.testItemIds || [] };
        await fetch(`${API_BASE}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：编辑产品；参数：产品ID与修改字段；返回值：void；用途：调用后端并刷新 */
      editItem: async (id, patch) => {
        const payload: any = {};
        if (patch.productCode) payload.product_code = patch.productCode;
        if (patch.productName) payload.product_name = patch.productName;
        if (patch.productType) payload.product_type = patch.productType;
        if (patch.status) payload.status = patch.status === '启用' ? 'enabled' : 'disabled';
        if (patch.testItemIds) payload.test_item_ids = patch.testItemIds;
        await fetch(`${API_BASE}/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：批量删除产品；参数：产品ID数组；返回值：void；用途：调用后端并刷新 */
      deleteItems: async (ids) => {
        await fetch(`${API_BASE}/products`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
      /** 函数功能：批量启用产品；参数：产品ID数组；返回值：void；用途：调用后端并刷新 */
      enableItems: async (ids) => {
        await fetch(`${API_BASE}/products/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
      /** 函数功能：批量禁用产品；参数：产品ID数组；返回值：void；用途：调用后端并刷新 */
      disableItems: async (ids) => {
        await fetch(`${API_BASE}/products/disable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      }
    }),
    { name: 'product-config-store' }
  )
);

