import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MsStatus = '待实验' | '进行中' | '异常' | '待审核' | '已审核' | '已取消' | '已完成';

export interface MsExperimentTask {
  id: string;
  sampleNo: string;
  productName: string;
  status: MsStatus;
  equipment?: string;
  startTime?: string;
  endTime?: string;
  auditTime?: string;
}

export interface MsItemResult {
  id: string;
  taskId: string;
  itemName: string;
  itemRange?: string;
  unit?: string;
  result?: string;
  interpret?: string;
}

export interface MsFilters {
  sampleNos?: string[];
  productIds?: string[];
  statuses?: MsStatus[];
  auditRange?: [string, string];
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
  tasks: MsExperimentTask[];
  items: MsItemResult[];
  filteredTasks: MsExperimentTask[];
  filteredItems: MsItemResult[];
  selectedRowKeys: string[];
  activeTaskId?: string;
  filters: MsFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setFilters: (f: Partial<MsFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  setActiveTaskId: (id?: string) => void;
  query: () => void;
  audit: (ids: string[]) => void;
  rerun: (ids: string[]) => void;
  cancel: (ids: string[]) => void;
  resetFilters: () => void;
}

const mockTasks: MsExperimentTask[] = [
  { id: 'me1', sampleNo: 'MS001', productName: '质谱-代谢组', status: '进行中', equipment: '质谱A', startTime: new Date().toISOString() },
  { id: 'me2', sampleNo: 'MS002', productName: '质谱-蛋白组', status: '已完成', equipment: '质谱B', startTime: new Date().toISOString(), endTime: new Date().toISOString() },
  { id: 'me3', sampleNo: 'MS003', productName: '质谱-脂质组', status: '待审核', equipment: '质谱C', endTime: new Date().toISOString() }
];

const mockItems: MsItemResult[] = [
  { id: 'mi1', taskId: 'me1', itemName: '峰A', itemRange: '-', unit: 'AU', result: '-', interpret: '-' },
  { id: 'mi2', taskId: 'me2', itemName: '峰B', itemRange: '-', unit: 'AU', result: '123.4', interpret: '正常' },
  { id: 'mi3', taskId: 'me3', itemName: '峰C', itemRange: '-', unit: 'AU', result: '12.7', interpret: '异常' }
];

const defaultFilters: MsFilters = {
  statuses: ['待实验', '进行中', '异常', '待审核']
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useMsExperimentStore = create<State & Actions>()(
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
        if (filters.auditRange?.[0] && filters.auditRange?.[1]) {
          const [st, et] = filters.auditRange;
          list = list.filter(t => t.auditTime ? new Date(t.auditTime) >= new Date(st) && new Date(t.auditTime) <= new Date(et) : false);
        }
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
        const detailItems = items.filter(r => (activeTaskId ? r.taskId === activeTaskId : page[0]?.id === r.taskId));
        set({ filteredTasks: page, filteredItems: detailItems, pagination: { ...pagination, total: list.length } });
      },
      audit: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '已审核', auditTime: new Date().toISOString() } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      rerun: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '进行中', startTime: new Date().toISOString(), endTime: undefined, auditTime: undefined } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      cancel: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, status: '已取消' } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      }
    }),
    { name: 'ms-experiment-store' }
  )
);

