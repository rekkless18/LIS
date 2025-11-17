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
  /** 函数功能：执行查询；参数：无；返回值：void；用途：按filters过滤并分页 */
  query: () => void;
  /** 函数功能：新建设备；参数：设备数据；返回值：void；用途：添加记录并刷新 */
  createDevice: (dev: Omit<Equipment, 'id'>) => void;
  /** 函数功能：编辑设备；参数：设备ID与新数据；返回值：void；用途：更新记录并刷新 */
  editDevice: (id: string, patch: Partial<Equipment>) => void;
  /** 函数功能：删除设备；参数：设备ID数组；返回值：void；用途：删除记录并刷新 */
  deleteDevices: (ids: string[]) => void;
  resetFilters: () => void;
}

const mockDevices: Equipment[] = [
  { id: 'd1', deviceNo: 'SEQ-001', deviceName: 'NovaSeq 6000', deviceType: '测序仪', status: '运行', location: '一号实验室', manufacturer: 'Illumina', purchaseDate: new Date('2023-03-01').toISOString(), owners: ['张三','李四'] },
  { id: 'd2', deviceNo: 'QPCR-021', deviceName: 'ABI7500', deviceType: 'QPCR仪', status: '维护', location: '二号实验室', manufacturer: 'Thermo', lastMaintenanceDate: new Date('2024-07-20').toISOString(), owners: ['王五'] },
  { id: 'd3', deviceNo: 'MS-110', deviceName: 'Orbitrap', deviceType: '质谱仪器', status: '关机', location: '质谱区A', manufacturer: 'Thermo', purchaseDate: new Date('2022-01-15').toISOString(), owners: ['赵六'] }
];

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
      query: () => {
        const { devices, filters, pagination } = get();
        let list = [...devices];
        if (filters.deviceNos?.length) list = list.filter(d => filters.deviceNos!.some(no => d.deviceNo.includes(no)));
        if (filters.deviceNameKeyword) list = list.filter(d => d.deviceName.includes(filters.deviceNameKeyword!));
        if (filters.deviceTypes?.length) list = list.filter(d => filters.deviceTypes!.includes(d.deviceType));
        if (filters.statuses?.length) list = list.filter(d => filters.statuses!.includes(d.status));
        if (filters.locationKeyword) list = list.filter(d => d.location.includes(filters.locationKeyword!));
        if (filters.manufacturerKeyword) list = list.filter(d => (d.manufacturer || '').includes(filters.manufacturerKeyword!));
        if (filters.purchaseRange?.[0] && filters.purchaseRange?.[1]) {
          const [st, et] = filters.purchaseRange; list = list.filter(d => d.purchaseDate ? new Date(d.purchaseDate) >= new Date(st) && new Date(d.purchaseDate) <= new Date(et) : false);
        }
        if (filters.maintenanceRange?.[0] && filters.maintenanceRange?.[1]) {
          const [st, et] = filters.maintenanceRange; list = list.filter(d => d.lastMaintenanceDate ? new Date(d.lastMaintenanceDate) >= new Date(st) && new Date(d.lastMaintenanceDate) <= new Date(et) : false);
        }
        if (filters.scrapRange?.[0] && filters.scrapRange?.[1]) {
          const [st, et] = filters.scrapRange; list = list.filter(d => d.scrapDate ? new Date(d.scrapDate) >= new Date(st) && new Date(d.scrapDate) <= new Date(et) : false);
        }
        if (filters.owners?.length) list = list.filter(d => (d.owners || []).some(o => filters.owners!.includes(o)));
        const startIdx = (pagination.current - 1) * pagination.pageSize;
        const page = list.slice(startIdx, startIdx + pagination.pageSize);
        set({ filteredDevices: page, pagination: { ...pagination, total: list.length } });
      },
      createDevice: (dev) => {
        set((s) => ({ devices: [{ id: `d${Date.now()}`, ...dev }, ...s.devices] }));
        get().query();
      },
      editDevice: (id, patch) => {
        set((s) => ({ devices: s.devices.map(d => d.id === id ? { ...d, ...patch } : d) }));
        get().query();
      },
      deleteDevices: (ids) => {
        set((s) => ({ devices: s.devices.filter(d => !ids.includes(d.id)), selectedRowKeys: s.selectedRowKeys.filter(k => !ids.includes(k)) }));
        get().query();
      }
    }),
    { name: 'equipment-store' }
  )
);

