import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PreRunStatus = '未下单' | '待开始' | '进行中' | '已完成' | '异常';

export interface PreRunTask {
  id: string;
  sampleNo: string;
  productName: string;
  status: PreRunStatus;
  qcResult?: string;
  workstation?: string;
  startTime?: string;
  endTime?: string;
}

export interface PreRunFilters {
  sampleNos?: string[];
  productIds?: string[];
  statuses?: PreRunStatus[];
  startRange?: [string, string];
  endRange?: [string, string];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface State {
  tasks: PreRunTask[];
  filteredTasks: PreRunTask[];
  selectedRowKeys: string[];
  filters: PreRunFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setFilters: (f: Partial<PreRunFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  query: () => void;
  order: (ids: string[]) => void;
  start: (ids: string[], payload?: { qcResult?: string; workstation?: string }) => void;
  cancel: (ids: string[]) => void;
}

const mock: PreRunTask[] = [
  { id: 'pr1', sampleNo: 'SMP001', productName: '外显子组测序', status: '未下单' },
  { id: 'pr2', sampleNo: 'SMP002', productName: '肿瘤标志物检测', status: '待开始' },
  { id: 'pr3', sampleNo: 'SMP003', productName: '全基因组测序', status: '进行中', startTime: new Date().toISOString(), workstation: '预处理工位A' }
];

const defaultFilters: PreRunFilters = {
  statuses: ['未下单', '待开始', '进行中', '异常']
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useSpecialPreRunStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      tasks: mock,
      filteredTasks: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }),
      query: () => {
        const { tasks, filters, pagination } = get();
        let list = [...tasks];
        if (filters.sampleNos?.length) list = list.filter(t => filters.sampleNos!.some(no => t.sampleNo.includes(no)));
        if (filters.productIds?.length) list = list.filter(t => filters.productIds!.some(pid => t.productName.includes(pid)));
        if (filters.statuses?.length) list = list.filter(t => filters.statuses!.includes(t.status));
        if (filters.startRange?.[0] && filters.startRange?.[1]) {
          const [st, et] = filters.startRange;
          list = list.filter(t => t.startTime ? new Date(t.startTime) >= new Date(st) && new Date(t.startTime) <= new Date(et) : false);
        }
        if (filters.endRange?.[0] && filters.endRange?.[1]) {
          const [st, et] = filters.endRange;
          list = list.filter(t => t.endTime ? new Date(t.endTime) >= new Date(st) && new Date(t.endTime) <= new Date(et) : false);
        }
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        set({ filteredTasks: page, pagination: { ...pagination, total: list.length } });
      },
      order: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '待开始' } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      start: (ids, payload) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '进行中', startTime: new Date().toISOString(), qcResult: payload?.qcResult, workstation: payload?.workstation || t.workstation } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      cancel: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '未下单', startTime: undefined, endTime: undefined } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      }
    }),
    { name: 'special-prerun-store' }
  )
);

