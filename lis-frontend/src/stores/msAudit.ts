import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MsAuditStatus = '待审核' | '已审核' | '不通过';

export interface MsAuditTask {
  id: string;
  sampleNo: string;
  productName: string;
  auditStatus: MsAuditStatus;
  reviewer?: string;
  completedAt?: string;
}

export interface MsAuditItem {
  id: string;
  taskId: string;
  itemName: string;
  spectrum?: string;
  result?: string;
  interpret?: string;
}

export interface MsAuditFilters {
  sampleNos?: string[];
  productIds?: string[];
  statuses?: MsAuditStatus[];
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
  tasks: MsAuditTask[];
  items: MsAuditItem[];
  filteredTasks: MsAuditTask[];
  filteredItems: MsAuditItem[];
  selectedRowKeys: string[];
  activeTaskId?: string;
  filters: MsAuditFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setFilters: (f: Partial<MsAuditFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  setActiveTaskId: (id?: string) => void;
  query: () => void;
  approve: (ids: string[]) => void;
  reject: (ids: string[], reason: string) => void;
  resetFilters: () => void;
}

const mockTasks: MsAuditTask[] = [
  { id: 'ma1', sampleNo: 'MS101', productName: '质谱-代谢组', auditStatus: '待审核' },
  { id: 'ma2', sampleNo: 'MS102', productName: '质谱-蛋白组', auditStatus: '待审核', completedAt: new Date().toISOString() },
  { id: 'ma3', sampleNo: 'MS103', productName: '质谱-脂质组', auditStatus: '已审核', reviewer: '李四', completedAt: new Date().toISOString() }
];

const mockItems: MsAuditItem[] = [
  { id: 'mai1', taskId: 'ma1', itemName: '峰X', spectrum: '谱图1', result: '123.1', interpret: '正常' },
  { id: 'mai2', taskId: 'ma2', itemName: '峰Y', spectrum: '谱图2', result: '12.7', interpret: '异常' },
  { id: 'mai3', taskId: 'ma3', itemName: '峰Z', spectrum: '谱图3', result: '7.2', interpret: '正常' }
];

const defaultFilters: MsAuditFilters = {
  statuses: ['待审核', '已审核', '不通过']
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useMsAuditStore = create<State & Actions>()(
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
    { name: 'ms-audit-store' }
  )
);

