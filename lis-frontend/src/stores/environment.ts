import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EnvStatus = '正常' | '异常';
export type ProtectionLevel = '一级' | '二级' | '三级';

export interface EnvRoom {
  id: string;
  roomNo: string;
  roomLocation: string;
  status: EnvStatus;
  protectionLevel: ProtectionLevel;
  temperature?: number;
  humidity?: number;
  pressure?: number;
}

export interface EnvFilters {
  roomNos?: string[];
  roomLocationKeyword?: string;
  statuses?: EnvStatus[];
  protectionLevels?: ProtectionLevel[];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface State {
  rooms: EnvRoom[];
  filteredRooms: EnvRoom[];
  selectedRowKeys: string[];
  filters: EnvFilters;
  pagination: PaginationConfig;
}

interface Actions {
  /** 函数功能：设置查询条件；参数：部分查询条件；返回值：void；用途：更新filters */
  setFilters: (f: Partial<EnvFilters>) => void;
  /** 函数功能：设置分页配置；参数：部分分页配置；返回值：void；用途：更新分页状态 */
  setPagination: (p: Partial<PaginationConfig>) => void;
  /** 函数功能：设置选择行；参数：选中行主键数组；返回值：void；用途：更新选择状态 */
  setSelectedRowKeys: (k: string[]) => void;
  /** 函数功能：执行查询；参数：无；返回值：void；用途：按filters过滤并分页 */
  query: () => void;
  /** 函数功能：新建房间；参数：房间数据；返回值：void；用途：添加记录并刷新 */
  createRoom: (room: Omit<EnvRoom, 'id'>) => void;
  /** 函数功能：编辑房间；参数：房间ID与新数据；返回值：void；用途：更新记录并刷新 */
  editRoom: (id: string, patch: Partial<EnvRoom>) => void;
  /** 函数功能：删除房间；参数：房间ID数组；返回值：void；用途：删除记录并刷新 */
  deleteRooms: (ids: string[]) => void;
  resetFilters: () => void;
}

const mockRooms: EnvRoom[] = [
  { id: 'r1', roomNo: 'A101', roomLocation: '一号楼一层东侧', status: '正常', protectionLevel: '一级', temperature: 22.5, humidity: 45, pressure: 101.3 },
  { id: 'r2', roomNo: 'B205', roomLocation: '二号楼二层西侧', status: '异常', protectionLevel: '二级', temperature: 28.1, humidity: 60, pressure: 100.8 },
  { id: 'r3', roomNo: 'C310', roomLocation: '三号楼三层中部', status: '正常', protectionLevel: '三级', temperature: 20.2, humidity: 40, pressure: 101.0 }
];

const defaultFilters: EnvFilters = {
  statuses: ['正常', '异常'],
  protectionLevels: ['一级', '二级', '三级']
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

export const useEnvironmentStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      rooms: mockRooms,
      filteredRooms: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
      setPagination: (p) => set((s) => ({ pagination: { ...s.pagination, ...p } })),
      setSelectedRowKeys: (k) => set({ selectedRowKeys: k }),
      resetFilters: () => set({ filters: defaultFilters }),
      query: () => {
        const { rooms, filters, pagination } = get();
        let list = [...rooms];
        if (filters.roomNos?.length) list = list.filter(r => filters.roomNos!.some(no => r.roomNo.includes(no)));
        if (filters.roomLocationKeyword) list = list.filter(r => r.roomLocation.includes(filters.roomLocationKeyword!));
        if (filters.statuses?.length) list = list.filter(r => filters.statuses!.includes(r.status));
        if (filters.protectionLevels?.length) list = list.filter(r => filters.protectionLevels!.includes(r.protectionLevel));
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        set({ filteredRooms: page, pagination: { ...pagination, total: list.length } });
      },
      createRoom: (room) => {
        set((s) => ({ rooms: [{ id: `r${Date.now()}`, ...room }, ...s.rooms] }));
        get().query();
      },
      editRoom: (id, patch) => {
        set((s) => ({ rooms: s.rooms.map(r => r.id === id ? { ...r, ...patch } : r) }));
        get().query();
      },
      deleteRooms: (ids) => {
        set((s) => ({ rooms: s.rooms.filter(r => !ids.includes(r.id)), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) }));
        get().query();
      }
    }),
    { name: 'environment-store' }
  )
);

