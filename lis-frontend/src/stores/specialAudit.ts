import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SpecialAuditStatus = '待审核' | '已审核' | '不通过';

export interface SpecialAuditTask {
  id: string;
  sampleNo: string;
  productName: string;
  auditStatus: SpecialAuditStatus;
  reviewer?: string;
  completedAt?: string;
}

export interface SpecialAuditItem {
  id: string;
  taskId: string;
  itemName: string;
  itemRange?: string;
  unit?: string;
  result?: string;
  interpret?: string;
}

export interface SpecialAuditFilters {
  sampleNos?: string[];
  productIds?: string[];
  statuses?: SpecialAuditStatus[];
  completedRange?: [string, string];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface State {
  tasks: SpecialAuditTask[];
  items: SpecialAuditItem[];
  filteredTasks: SpecialAuditTask[];
  filteredItems: SpecialAuditItem[];
  selectedRowKeys: string[];
  activeTaskId?: string;
  filters: SpecialAuditFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setFilters: (f: Partial<SpecialAuditFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  setActiveTaskId: (id?: string) => void;
  query: () => void;
  approve: (ids: string[]) => void;
  reject: (ids: string[], reason: string) => void;
  resetFilters: () => void;
}

const mockTasks: SpecialAuditTask[] = [
  { id: 'sa1', sampleNo: 'SMP301', productName: '特检-病原体', auditStatus: '待审核' },
  { id: 'sa2', sampleNo: 'SMP302', productName: '特检-肿瘤标志物', auditStatus: '待审核', completedAt: new Date().toISOString() },
  { id: 'sa3', sampleNo: 'SMP303', productName: '特检-遗传病', auditStatus: '已审核', reviewer: '张三', completedAt: new Date().toISOString() }
];

const mockItems: SpecialAuditItem[] = [
  { id: 'sai1', taskId: 'sa1', itemName: 'MarkerA', itemRange: '0-10', unit: 'ng/mL', result: '5.2', interpret: '正常' },
  { id: 'sai2', taskId: 'sa2', itemName: 'MarkerB', itemRange: '0-10', unit: 'ng/mL', result: '12.1', interpret: '异常' },
  { id: 'sai3', taskId: 'sa3', itemName: 'MarkerC', itemRange: '0-10', unit: 'ng/mL', result: '3.3', interpret: '正常' }
];

const defaultFilters: SpecialAuditFilters = {
  statuses: ['待审核', '已审核', '不通过']
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useSpecialAuditStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,
      items: mockItems,
      filteredTasks: [],
      filteredItems: [],
      selectedRowKeys: [],
      activeTaskId: undefined,
      filters: defaultFilters,
      pagination: defaultPagination,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }),
      resetFilters: () => set({ filters: defaultFilters }),
      setActiveTaskId: (id) => set({ activeTaskId: id }),
      query: () => {
        const { tasks, filters, pagination, activeTaskId, items } = get();
        let list = [...tasks];
        if (filters.sampleNos?.length) list = list.filter(t => filters.sampleNos!.some(no => t.sampleNo.includes(no)));
        if (filters.productIds?.length) list = list.filter(t => filters.productIds!.some(pid => t.productName.includes(pid)));
        if (filters.statuses?.length) list = list.filter(t => filters.statuses!.includes(t.auditStatus));
        if (filters.completedRange?.[0] && filters.completedRange?.[1]) {
          const [st, et] = filters.completedRange;
          list = list.filter(t => t.completedAt ? new Date(t.completedAt) >= new Date(st) && new Date(t.completedAt) <= new Date(et) : false);
        }
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        const detailItems = items.filter(r => (activeTaskId ? r.taskId === activeTaskId : page[0]?.id === r.taskId));
        set({ filteredTasks: page, filteredItems: detailItems, pagination: { ...pagination, total: list.length } });
      },
      approve: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, auditStatus: '已审核', reviewer: '当前用户' } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      reject: (ids, reason) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, auditStatus: '不通过', reviewer: reason ? `原因:${reason}` : t.reviewer } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      }
    }),
    { name: 'special-audit-store' }
  )
);

