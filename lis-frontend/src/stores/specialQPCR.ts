import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type QPCRAnalysisStatus = '待分析' | '进行中' | '已完成' | '失败';
export type QPCRAuditStatus = '待审核' | '已审核' | '不通过';

export interface QPCRTask {
  id: string;
  sampleNo: string;
  productName: string;
  analysisStatus: QPCRAnalysisStatus;
  auditStatus: QPCRAuditStatus;
  startTime?: string;
  endTime?: string;
}

export interface QPCRItemResult {
  id: string;
  taskId: string;
  itemName: string;
  itemRange?: string;
  unit?: string;
  result?: string;
  interpret?: string;
  cq?: string;
  curve?: string;
}

export interface QPCRFilters {
  sampleNos?: string[];
  productIds?: string[];
  analysisStatuses?: QPCRAnalysisStatus[];
  auditStatuses?: QPCRAuditStatus[];
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
  tasks: QPCRTask[];
  itemResults: QPCRItemResult[];
  filteredTasks: QPCRTask[];
  filteredItems: QPCRItemResult[];
  selectedRowKeys: string[];
  activeTaskId?: string;
  filters: QPCRFilters;
  pagination: PaginationConfig;
}

interface Actions {
  setFilters: (f: Partial<QPCRFilters>) => void;
  setPagination: (p: Partial<PaginationConfig>) => void;
  setSelectedRowKeys: (k: string[]) => void;
  setActiveTaskId: (id?: string) => void;
  query: () => void;
  startAnalysis: (ids: string[]) => void;
  rerun: (ids: string[]) => void;
  audit: (ids: string[]) => void;
  resetFilters: () => void;
}

const mockTasks: QPCRTask[] = [
  { id: 'q1', sampleNo: 'SMP101', productName: 'QPCR病原体检测', analysisStatus: '待分析', auditStatus: '待审核' },
  { id: 'q2', sampleNo: 'SMP102', productName: 'QPCR肿瘤标志物', analysisStatus: '进行中', auditStatus: '待审核', startTime: new Date().toISOString() },
  { id: 'q3', sampleNo: 'SMP103', productName: 'QPCR病原体检测', analysisStatus: '已完成', auditStatus: '已审核', startTime: new Date().toISOString(), endTime: new Date().toISOString() }
];

const mockItems: QPCRItemResult[] = [
  { id: 'qi1', taskId: 'q1', itemName: 'GeneA', itemRange: 'Ct<35', unit: 'Ct', result: '-', interpret: '-', cq: '-', curve: '-' },
  { id: 'qi2', taskId: 'q2', itemName: 'GeneB', itemRange: 'Ct<35', unit: 'Ct', result: '33.2', interpret: '阳性', cq: '33.2', curve: '标准曲线1' },
  { id: 'qi3', taskId: 'q3', itemName: 'GeneC', itemRange: 'Ct<35', unit: 'Ct', result: '29.8', interpret: '阳性', cq: '29.8', curve: '标准曲线2' }
];

const defaultFilters: QPCRFilters = {
  analysisStatuses: ['待分析', '进行中', '失败'],
  auditStatuses: ['待审核', '已审核', '不通过']
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useSpecialQPCRStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      tasks: mockTasks,
      itemResults: mockItems,
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
        const { tasks, filters, pagination, activeTaskId, itemResults } = get();
        let list = [...tasks];
        if (filters.sampleNos?.length) list = list.filter(t => filters.sampleNos!.some(no => t.sampleNo.includes(no)));
        if (filters.productIds?.length) list = list.filter(t => filters.productIds!.some(pid => t.productName.includes(pid)));
        if (filters.analysisStatuses?.length) list = list.filter(t => filters.analysisStatuses!.includes(t.analysisStatus));
        if (filters.auditStatuses?.length) list = list.filter(t => filters.auditStatuses!.includes(t.auditStatus));
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
        const items = itemResults.filter(r => (activeTaskId ? r.taskId === activeTaskId : page[0]?.id === r.taskId));
        set({ filteredTasks: page, filteredItems: items, pagination: { ...pagination, total: list.length } });
      },
      startAnalysis: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, analysisStatus: '进行中', startTime: new Date().toISOString() } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      rerun: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, analysisStatus: '进行中', startTime: new Date().toISOString(), endTime: undefined } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      },
      audit: (ids) => {
        set((s) => ({
          tasks: s.tasks.map(t => ids.includes(t.id) ? { ...t, auditStatus: '已审核' } : t),
          selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k))
        }));
      }
    }),
    { name: 'special-qpcr-store' }
  )
);

