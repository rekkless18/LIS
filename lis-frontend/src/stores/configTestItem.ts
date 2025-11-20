import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TestItemType = '普检检测项' | '特检检测项' | '质谱检测项' | '研发检测项' | '其他检测项';
export type JudgeType = '上限' | '下限' | '上下限' | '定性' | '阴阳性' | '聚合';
export type EnableStatus = '启用' | '禁用';

export interface TestItem {
  id: string;
  itemCode: string;
  itemName: string;
  itemTypes: TestItemType[];
  judgeTypes: JudgeType[];
  status: EnableStatus;
  createdAt?: string;
  limitUpper?: number | null;
  limitLower?: number | null;
  unit?: string | null;
  qualitativeValue?: string | null;
  aggregateCondition?: string;
  aggregateItems?: { childId: string, result: string }[];
}

export interface TestItemFilters {
  codes?: string[];
  nameKeyword?: string;
  itemTypes?: TestItemType[];
  judgeTypes?: JudgeType[];
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
  items: TestItem[];
  filteredItems: TestItem[];
  selectedRowKeys: string[];
  filters: TestItemFilters;
  pagination: PaginationConfig;
}

interface Actions {
  // 功能：更新筛选条件；参数：部分筛选字段；返回：void
  setFilters: (f: Partial<TestItemFilters>) => void;
  // 功能：更新分页配置；参数：部分分页字段；返回：void
  setPagination: (p: Partial<PaginationConfig>) => void;
  // 功能：更新选中行；参数：ID数组；返回：void
  setSelectedRowKeys: (k: string[]) => void;
  // 功能：按筛选和分页调用后端查询检测项；参数：无；返回：void（内部更新状态）
  query: () => Promise<void>;
  // 功能：创建检测项；参数：不含id的检测项；返回：void（调用后端后刷新）
  createItem: (it: Omit<TestItem, 'id'>) => Promise<void>;
  // 功能：编辑检测项；参数：id与修改字段；返回：void（调用后端后刷新）
  editItem: (id: string, patch: Partial<TestItem>) => Promise<void>;
  // 功能：批量删除；参数：ID数组；返回：void（调用后端后刷新）
  deleteItems: (ids: string[]) => Promise<void>;
  // 功能：批量启用；参数：ID数组；返回：void（调用后端后刷新）
  enableItems: (ids: string[]) => Promise<void>;
  // 功能：批量禁用；参数：ID数组；返回：void（调用后端后刷新）
  disableItems: (ids: string[]) => Promise<void>;
}

// 功能：后端API基础路径；参数：环境变量 VITE_API_BASE；返回：字符串
const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
const FULL_TYPE_OPTIONS: TestItemType[] = ['普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项'];
const FULL_JUDGE_OPTIONS: JudgeType[] = ['上限','下限','上下限','定性','阴阳性','聚合'];
const FULL_STATUS_OPTIONS: EnableStatus[] = ['启用','禁用'];
let lastController: AbortController | null = null;

const defaultFilters: TestItemFilters = { itemTypes: ['普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项'], judgeTypes: ['上限','下限','上下限','定性','阴阳性','聚合'], statuses: ['启用','禁用'] };
const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] };

export const useTestItemConfigStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      // 功能：初始状态；参数：无；返回：状态对象
      items: [],
      filteredItems: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      // 功能：更新筛选条件
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      // 功能：更新分页配置
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
      // 功能：更新选中行
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }),
      // 功能：调用后端查询接口并分页
      query: async () => {
        const { filters, pagination } = get();
        // 取消上一次查询，避免并发导致浏览器中断
        if (lastController) lastController.abort();
        lastController = new AbortController();
        const params = new URLSearchParams();
        if (filters.codes?.length) params.set('codes', filters.codes.join(','));
        if (filters.nameKeyword) params.set('nameKeyword', filters.nameKeyword);
        if (filters.itemTypes?.length && !(filters.itemTypes.length === FULL_TYPE_OPTIONS.length && filters.itemTypes.every(t => FULL_TYPE_OPTIONS.includes(t)))) {
          params.set('itemTypes', filters.itemTypes.join(','));
        }
        if (filters.judgeTypes?.length && !(filters.judgeTypes.length === FULL_JUDGE_OPTIONS.length && filters.judgeTypes.every(j => FULL_JUDGE_OPTIONS.includes(j)))) {
          params.set('judgeTypes', filters.judgeTypes.join(','));
        }
        if (filters.statuses?.length && !(filters.statuses.length === FULL_STATUS_OPTIONS.length && filters.statuses.every(s => FULL_STATUS_OPTIONS.includes(s)))) {
          params.set('statuses', filters.statuses.join(','));
        }
        if (filters.createdRange?.[0]) params.set('createdStart', filters.createdRange[0]);
        if (filters.createdRange?.[1]) params.set('createdEnd', filters.createdRange[1]);
        params.set('pageNo', String(pagination.current));
        params.set('pageSize', String(pagination.pageSize));
        try {
          const resp = await fetch(`${API_BASE}/test-items?${params.toString()}`, { signal: lastController.signal });
          if (!resp.ok) {
            set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } });
            return;
          }
          const json = await resp.json();
        const rows = (json.data || []).map((r: any) => ({
          id: r.id,
          itemCode: r.item_code,
          itemName: r.item_name,
          itemTypes: r.item_type ? [r.item_type] : [],
          judgeTypes: r.judgement_type ? [r.judgement_type] : [],
          status: r.status === 'enabled' ? '启用' : '禁用',
          createdAt: r.created_at,
          limitUpper: r.limit_upper ?? null,
          limitLower: r.limit_lower ?? null,
          unit: r.unit ?? null,
          qualitativeValue: r.qualitative_value ?? null,
          aggregateCondition: r.aggregate_condition,
          aggregateItems: (r.aggregate_items || []).map((x: any) => ({ childId: x.child_item_id, result: x.result })),
        })) as TestItem[];
          set({ items: rows, filteredItems: rows, pagination: { ...pagination, total: json.total || rows.length } });
        } catch (e: any) {
          // 忽略主动取消导致的异常
          if (e?.name === 'AbortError') return;
          set({ items: [], filteredItems: [], pagination: { ...pagination, total: 0 } });
        }
      },
      // 功能：创建检测项并刷新
      createItem: async (it) => {
        const payload = {
          item_code: it.itemCode,
          item_name: it.itemName,
          item_type: (it.itemTypes || [])[0],
          judgement_type: (it.judgeTypes || [])[0],
          status: it.status === '启用' ? 'enabled' : 'disabled',
          limit_upper: it.limitUpper,
          limit_lower: it.limitLower,
          unit: it.unit,
          qualitative_value: it.qualitativeValue,
          condition: it.aggregateCondition,
          items: (it.aggregateItems || []).map(r => ({ child_id: r.childId, result: r.result })),
        };
        await fetch(`${API_BASE}/test-items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      // 功能：编辑检测项并刷新
      editItem: async (id, patch) => {
        const payload: any = {};
        if (patch.itemCode) payload.item_code = patch.itemCode;
        if (patch.itemName) payload.item_name = patch.itemName;
        if (patch.itemTypes) payload.item_type = patch.itemTypes[0];
        if (patch.judgeTypes) payload.judgement_type = patch.judgeTypes[0];
        if (patch.status) payload.status = patch.status === '启用' ? 'enabled' : 'disabled';
        if (typeof patch.limitUpper !== 'undefined') payload.limit_upper = patch.limitUpper;
        if (typeof patch.limitLower !== 'undefined') payload.limit_lower = patch.limitLower;
        if (typeof patch.unit !== 'undefined') payload.unit = patch.unit;
        if (typeof patch.qualitativeValue !== 'undefined') payload.qualitative_value = patch.qualitativeValue;
        if (typeof patch.aggregateCondition !== 'undefined') payload.condition = patch.aggregateCondition;
        if (typeof patch.aggregateItems !== 'undefined') payload.items = (patch.aggregateItems || []).map(r => ({ child_id: r.childId, result: r.result }));
        await fetch(`${API_BASE}/test-items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      // 功能：批量删除并刷新
      deleteItems: async (ids) => {
        await fetch(`${API_BASE}/test-items`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
      // 功能：批量启用并刷新
      enableItems: async (ids) => {
        await fetch(`${API_BASE}/test-items/enable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
      // 功能：批量禁用并刷新
      disableItems: async (ids) => {
        await fetch(`${API_BASE}/test-items/disable`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      },
    }),
    { name: 'testitem-config-store' }
  )
);

