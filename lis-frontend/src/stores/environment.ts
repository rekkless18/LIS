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
  /** 函数功能：执行查询；参数：无；返回值：Promise<void>；用途：调用后端接口并更新列表与分页 */
  query: () => Promise<void>;
  /** 函数功能：新建房间；参数：房间数据；返回值：Promise<void>；用途：调用后端创建并刷新列表 */
  createRoom: (room: Omit<EnvRoom, 'id'>) => Promise<void>;
  /** 函数功能：编辑房间；参数：房间ID与新数据；返回值：Promise<void>；用途：调用后端更新并刷新列表 */
  editRoom: (id: string, patch: Partial<EnvRoom>) => Promise<void>;
  /** 函数功能：删除房间；参数：房间ID数组；返回值：Promise<void>；用途：调用后端删除并刷新列表 */
  deleteRooms: (ids: string[]) => Promise<void>;
  resetFilters: () => void;
}

const mockRooms: EnvRoom[] = [];

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

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
let lastController: AbortController | null = null;

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
      /** 函数功能：执行查询；参数：无；返回值：Promise<void>；用途：调用后端接口并更新列表与分页 */
      query: async () => {
        const { filters, pagination } = get();
        if (lastController) lastController.abort();
        lastController = new AbortController();
        const params = new URLSearchParams();
        if (filters.roomNos?.length) params.set('roomNos', filters.roomNos.join(','));
        if (filters.roomLocationKeyword) params.set('roomLocationKeyword', filters.roomLocationKeyword);
        if (filters.statuses?.length) params.set('statuses', filters.statuses.join(','));
        if (filters.protectionLevels?.length) params.set('protectionLevels', filters.protectionLevels.join(','));
        params.set('pageNo', String(pagination.current));
        params.set('pageSize', String(pagination.pageSize));
        try {
          const resp = await fetch(`${API_BASE}/rooms?${params.toString()}`, { signal: lastController.signal });
          if (!resp.ok) {
            set({ rooms: [], filteredRooms: [], pagination: { ...pagination, total: 0 } });
            return;
          }
          const json = await resp.json();
          const rows = (json.data || []).map((r: any) => ({
            id: r.id,
            roomNo: r.room_code,
            roomLocation: r.room_location,
            status: r.status_cn as EnvStatus,
            protectionLevel: r.protection_level_cn as ProtectionLevel,
            temperature: r.temperature,
            humidity: r.humidity,
            pressure: r.pressure,
          })) as EnvRoom[];
          set({ rooms: rows, filteredRooms: rows, pagination: { ...pagination, total: json.total || rows.length } });
        } catch (e: any) {
          if (e?.name === 'AbortError') return;
          set({ rooms: [], filteredRooms: [], pagination: { ...pagination, total: 0 } });
        }
      },
      /** 函数功能：新建房间；参数：房间数据；返回值：Promise<void>；用途：调用后端创建并刷新列表 */
      createRoom: async (room) => {
        const payload = {
          room_code: room.roomNo,
          room_location: room.roomLocation,
          protection_level: room.protectionLevel,
          status: room.status,
        };
        await fetch(`${API_BASE}/rooms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：编辑房间；参数：房间ID与新数据；返回值：Promise<void>；用途：调用后端更新并刷新列表 */
      editRoom: async (id, patch) => {
        const payload: any = {};
        if (patch.roomNo) payload.room_code = patch.roomNo;
        if (patch.roomLocation) payload.room_location = patch.roomLocation;
        if (patch.protectionLevel) payload.protection_level = patch.protectionLevel;
        if (patch.status) payload.status = patch.status;
        await fetch(`${API_BASE}/rooms/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：删除房间；参数：房间ID数组；返回值：Promise<void>；用途：调用后端删除并刷新列表 */
      deleteRooms: async (ids) => {
        await fetch(`${API_BASE}/rooms`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      }
    }),
    { name: 'environment-store' }
  )
);

