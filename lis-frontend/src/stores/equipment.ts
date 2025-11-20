import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DeviceType = '测序仪' | 'QPCR仪' | '离心机' | '培养箱' | '生化仪器' | '质谱仪器' | '血液仪器' | '冰箱' | '其他';
export type DeviceStatus = '运行' | '关机' | '维护' | '故障' | '报废';

export interface Equipment {
  id: string;
  deviceNo: string;
  deviceName: string;
  deviceType: DeviceType;
  status: DeviceStatus;
  location: string;
  manufacturer?: string;
  purchaseDate?: string;
  lastMaintenanceDate?: string;
  scrapDate?: string;
  owners?: string[];
}

export interface EquipmentFilters {
  deviceNos?: string[];
  deviceNameKeyword?: string;
  deviceTypes?: DeviceType[];
  statuses?: DeviceStatus[];
  locationKeyword?: string;
  manufacturerKeyword?: string;
  purchaseRange?: [string, string];
  maintenanceRange?: [string, string];
  scrapRange?: [string, string];
  owners?: string[];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface State {
  devices: Equipment[];
  filteredDevices: Equipment[];
  selectedRowKeys: string[];
  filters: EquipmentFilters;
  pagination: PaginationConfig;
}

interface Actions {
  /** 函数功能：设置查询条件；参数：部分查询条件；返回值：void；用途：更新filters */
  setFilters: (f: Partial<EquipmentFilters>) => void;
  /** 函数功能：设置分页配置；参数：部分分页配置；返回值：void；用途：更新分页状态 */
  setPagination: (p: Partial<PaginationConfig>) => void;
  /** 函数功能：设置选择行；参数：选中行主键数组；返回值：void；用途：更新选择状态 */
  setSelectedRowKeys: (k: string[]) => void;
  /** 函数功能：执行查询；参数：无；返回值：Promise<void>；用途：调用后端接口并更新列表与分页 */
  query: () => Promise<void>;
  /** 函数功能：新建设备；参数：设备数据；返回值：Promise<void>；用途：调用后端创建并刷新列表 */
  createDevice: (dev: Omit<Equipment, 'id'>) => Promise<void>;
  /** 函数功能：编辑设备；参数：设备ID与新数据；返回值：Promise<void>；用途：调用后端更新并刷新列表 */
  editDevice: (id: string, patch: Partial<Equipment>) => Promise<void>;
  /** 函数功能：删除设备；参数：设备ID数组；返回值：Promise<void>；用途：调用后端删除并刷新列表 */
  deleteDevices: (ids: string[]) => Promise<void>;
  resetFilters: () => void;
}

const mockDevices: Equipment[] = [];

const defaultFilters: EquipmentFilters = {
  deviceTypes: ['测序仪','QPCR仪','离心机','培养箱','生化仪器','质谱仪器','血液仪器','冰箱','其他'],
  statuses: ['运行','关机','维护','故障','报废']
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10','20','50','100']
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';
let lastController: AbortController | null = null;

export const useEquipmentStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      devices: mockDevices,
      filteredDevices: [],
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
        if (filters.deviceNos?.length) params.set('deviceNos', filters.deviceNos.join(','));
        if (filters.deviceNameKeyword) params.set('deviceNameKeyword', filters.deviceNameKeyword);
        if (filters.deviceTypes?.length) params.set('deviceTypes', filters.deviceTypes.join(','));
        if (filters.statuses?.length) params.set('statuses', filters.statuses.join(','));
        if (filters.locationKeyword) params.set('locationKeyword', filters.locationKeyword);
        if (filters.manufacturerKeyword) params.set('manufacturerKeyword', filters.manufacturerKeyword);
        if (filters.purchaseRange?.[0]) params.set('purchaseStart', filters.purchaseRange[0]);
        if (filters.purchaseRange?.[1]) params.set('purchaseEnd', filters.purchaseRange[1]);
        if (filters.maintenanceRange?.[0]) params.set('maintenanceStart', filters.maintenanceRange[0]);
        if (filters.maintenanceRange?.[1]) params.set('maintenanceEnd', filters.maintenanceRange[1]);
        if (filters.scrapRange?.[0]) params.set('scrapStart', filters.scrapRange[0]);
        if (filters.scrapRange?.[1]) params.set('scrapEnd', filters.scrapRange[1]);
        if (filters.owners?.length) params.set('owners', filters.owners.join(','));
        params.set('pageNo', String(pagination.current));
        params.set('pageSize', String(pagination.pageSize));
        try {
          const resp = await fetch(`${API_BASE}/equipment?${params.toString()}`, { signal: lastController.signal });
          if (!resp.ok) {
            set({ devices: [], filteredDevices: [], pagination: { ...pagination, total: 0 } });
            return;
          }
          const json = await resp.json();
          const rows = (json.data || []).map((r: any) => ({
            id: r.id,
            deviceNo: r.device_code,
            deviceName: r.device_name,
            deviceType: r.device_type_cn as DeviceType,
            status: r.status_cn as DeviceStatus,
            location: r.device_location,
            manufacturer: r.manufacturer,
            purchaseDate: r.purchase_date,
            lastMaintenanceDate: r.last_maintenance_date,
            scrapDate: r.scrap_date,
            owners: r.owners || [],
          })) as Equipment[];
          set({ devices: rows, filteredDevices: rows, pagination: { ...pagination, total: json.total || rows.length } });
        } catch (e: any) {
          if (e?.name === 'AbortError') return;
          set({ devices: [], filteredDevices: [], pagination: { ...pagination, total: 0 } });
        }
      },
      /** 函数功能：新建设备；参数：设备数据；返回值：Promise<void>；用途：调用后端创建并刷新列表 */
      createDevice: async (dev) => {
        const payload = {
          device_code: dev.deviceNo,
          device_name: dev.deviceName,
          device_type: dev.deviceType,
          device_status: dev.status,
          device_location: dev.location,
          manufacturer: dev.manufacturer,
          purchase_date: dev.purchaseDate,
          last_maintenance_date: dev.lastMaintenanceDate,
          scrap_date: dev.scrapDate,
        };
        await fetch(`${API_BASE}/equipment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：编辑设备；参数：设备ID与新数据；返回值：Promise<void>；用途：调用后端更新并刷新列表 */
      editDevice: async (id, patch) => {
        const payload: any = {};
        if (patch.deviceNo) payload.device_code = patch.deviceNo;
        if (patch.deviceName) payload.device_name = patch.deviceName;
        if (patch.deviceType) payload.device_type = patch.deviceType;
        if (patch.status) payload.device_status = patch.status;
        if (patch.location) payload.device_location = patch.location;
        if (typeof patch.manufacturer !== 'undefined') payload.manufacturer = patch.manufacturer;
        if (typeof patch.purchaseDate !== 'undefined') payload.purchase_date = patch.purchaseDate;
        if (typeof patch.lastMaintenanceDate !== 'undefined') payload.last_maintenance_date = patch.lastMaintenanceDate;
        if (typeof patch.scrapDate !== 'undefined') payload.scrap_date = patch.scrapDate;
        await fetch(`${API_BASE}/equipment/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        await get().query();
      },
      /** 函数功能：删除设备；参数：设备ID数组；返回值：Promise<void>；用途：调用后端删除并刷新列表 */
      deleteDevices: async (ids) => {
        await fetch(`${API_BASE}/equipment`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }) });
        set({ selectedRowKeys: [] });
        await get().query();
      }
    }),
    { name: 'equipment-store' }
  )
);

