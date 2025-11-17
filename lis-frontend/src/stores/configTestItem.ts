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
  setFilters: (f: Partial<TestItemFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  query: () => void;
  createItem: (it: Omit<TestItem, 'id'>) => void;
  editItem: (id: string, patch: Partial<TestItem>) => void;
  deleteItems: (ids: string[]) => void;
  enableItems: (ids: string[]) => void;
  disableItems: (ids: string[]) => void;
}

const mock: TestItem[] = [
  { id: 'ti1', itemCode: 'TI-001', itemName: '检测项X', itemTypes: ['普检检测项'], judgeTypes: ['上下限'], status: '启用', createdAt: new Date().toISOString() },
  { id: 'ti2', itemCode: 'TI-002', itemName: '检测项Y', itemTypes: ['特检检测项','研发检测项'], judgeTypes: ['定性','阴阳性'], status: '禁用', createdAt: new Date().toISOString() }
];

const defaultFilters: TestItemFilters = { itemTypes: ['普检检测项','特检检测项','质谱检测项','研发检测项','其他检测项'], judgeTypes: ['上限','下限','上下限','定性','阴阳性','聚合'], statuses: ['启用','禁用'] };
const defaultPagination: PaginationConfig = { current: 1, pageSize: 20, total: 0, showSizeChanger: true, pageSizeOptions: ['10','20','50','100'] };

export const useTestItemConfigStore = create<State & Actions>()(
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
      query: () => {
        const { items, filters, pagination } = get();
        let list = [...items];
        if (filters.codes?.length) list = list.filter(d => filters.codes!.some(code => d.itemCode.includes(code)));
        if (filters.nameKeyword) list = list.filter(d => d.itemName.includes(filters.nameKeyword!));
        if (filters.itemTypes?.length) list = list.filter(d => d.itemTypes.some(t => filters.itemTypes!.includes(t)));
        if (filters.judgeTypes?.length) list = list.filter(d => d.judgeTypes.some(j => filters.judgeTypes!.includes(j)));
        if (filters.statuses?.length) list = list.filter(d => filters.statuses!.includes(d.status));
        if (filters.createdRange?.[0] && filters.createdRange?.[1]) {
          const [st, et] = filters.createdRange; list = list.filter(d => d.createdAt ? new Date(d.createdAt) >= new Date(st) && new Date(d.createdAt) <= new Date(et) : false);
        }
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        set({ filteredItems: page, pagination: { ...pagination, total: list.length } });
      },
      createItem: (it) => { set((s) => ({ items: [{ id: `ti${Date.now()}`, ...it }, ...s.items] })); get().query(); },
      editItem: (id, patch) => { set((s) => ({ items: s.items.map(d => d.id === id ? { ...d, ...patch } : d) })); get().query(); },
      deleteItems: (ids) => { set((s) => ({ items: s.items.filter(d => !ids.includes(d.id)), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) })); get().query(); },
      enableItems: (ids) => { set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '启用' } : d), selectedRowKeys: [] })); get().query(); },
      disableItems: (ids) => { set((s) => ({ items: s.items.map(d => ids.includes(d.id) ? { ...d, status: '禁用' } : d), selectedRowKeys: [] })); get().query(); }
    }),
    { name: 'testitem-config-store' }
  )
);

