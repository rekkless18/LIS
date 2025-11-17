import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SpecialExceptionStatus = '待处理' | '已重测' | '已提交';

export interface SpecialExceptionTask {
  id: string;
  sampleNo: string;
  productName: string;
  status: SpecialExceptionStatus;
  device?: string;
  startTime?: string;
  endTime?: string;
  retestTime?: string;
}

export interface SpecialExceptionItem {
  id: string;
  taskId: string;
  itemName: string;
  result?: string;
  interpret?: string;
  history1?: string;
  history2?: string;
  history3?: string;
}

export interface SpecialExceptionFilters {
  sampleNos?: string[];
  productIds?: string[];
  statuses?: SpecialExceptionStatus[];
  startRange?: [string, string];
  endRange?: [string, string];
  retestRange?: [string, string];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface State {
  tasks: SpecialExceptionTask[];
  items: SpecialExceptionItem[];
  filteredTasks: SpecialExceptionTask[];
  filteredItems: SpecialExceptionItem[];
  selectedRowKeys: string[];
  activeTaskId?: string;
  filters: SpecialExceptionFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setFilters: (f: Partial<SpecialExceptionFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  setActiveTaskId: (id?: string) => void;
  query: () => void;
  submit: (ids: string[]) => void;
  retest: (ids: string[]) => void;
  cancel: (ids: string[]) => void;
  resetFilters: () => void;
}

const mockTasks: SpecialExceptionTask[] = [
  { id: 'se1', sampleNo: 'SMP501', productName: '特检-病原体', status: '待处理', device: '设备A' },
  { id: 'se2', sampleNo: 'SMP502', productName: '特检-肿瘤标志物', status: '已重测', device: '设备B', retestTime: new Date().toISOString() },
  { id: 'se3', sampleNo: 'SMP503', productName: '特检-遗传病', status: '已提交', device: '设备C', startTime: new Date().toISOString(), endTime: new Date().toISOString() }
];

const mockItems: SpecialExceptionItem[] = [
  { id: 'sei1', taskId: 'se1', itemName: 'MarkerA', result: '异常', interpret: '复核', history1: '-', history2: '-', history3: '-' },
  { id: 'sei2', taskId: 'se2', itemName: 'MarkerB', result: '正常', interpret: '通过', history1: '异常', history2: '复核', history3: '正常' },
  { id: 'sei3', taskId: 'se3', itemName: 'MarkerC', result: '异常', interpret: '复核', history1: '异常', history2: '异常', history3: '异常' }
];

const defaultFilters: SpecialExceptionFilters = {
  statuses: ['待处理', '已重测', '已提交']
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useSpecialExceptionStore = create<State & Actions>()(
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
        if (filters.statuses?.length) list = list.filter(t => filters.statuses!.includes(t.status));
        if (filters.startRange?.[0] && filters.startRange?.[1]) {
          const [st, et] = filters.startRange;
          list = list.filter(t => t.startTime ? new Date(t.startTime) >= new Date(st) && new Date(t.startTime) <= new Date(et) : false);
        }
        if (filters.endRange?.[0] && filters.endRange?.[1]) {
          const [st, et] = filters.endRange;
          list = list.filter(t => t.endTime ? new Date(t.endTime) >= new Date(st) && new Date(t.endTime) <= new Date(et) : false);
        }
        if (filters.retestRange?.[0] && filters.retestRange?.[1]) {
          const [st, et] = filters.retestRange;
          list = list.filter(t => t.retestTime ? new Date(t.retestTime) >= new Date(st) && new Date(t.retestTime) <= new Date(et) : false);
        }
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        const detailItems = items.filter(r => (activeTaskId ? r.taskId === activeTaskId : page[0]?.id === r.taskId));
        set({ filteredTasks: page, filteredItems: detailItems, pagination: { ...pagination, total: list.length } });
      },
      submit: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '已提交' } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      retest: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '已重测', retestTime: new Date().toISOString() } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      cancel: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '待处理', startTime: undefined, endTime: undefined, retestTime: undefined } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      }
    }),
    { name: 'special-exception-store' }
  )
);

