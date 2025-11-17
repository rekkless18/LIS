import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'processing' | 'partially_completed' | 'completed' | 'cancelled' | 'exception';
export type OrderType = 'product' | 'package';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

export interface Customer {
  id: string;
  name: string;
  code: string;
  country: string;
  province: string;
  region: string;
  contractNo: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  type: string;
}

export interface Package {
  id: string;
  name: string;
  code: string;
  type: string;
  sampleCount: number;
  sampleTypes: string[];
  products: Product[];
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  idType: 'id_card' | 'passport' | 'other';
  idNumber: string;
  nativePlace?: string;
  birthDate?: string;
  ageType?: 'normal' | 'under_one_year';
  age?: number;
  monthAge?: number;
  gender?: 'male' | 'female' | 'unknown';
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNo: string;
  type: OrderType;
  customerId: string;
  customer: Customer;
  patientId: string;
  patient: Patient;
  status: OrderStatus;
  priority: Priority;
  sampleNos: string[];
  originalSampleNos?: string[];
  sampleTypes: string[];
  samplingTime: string;
  deliveryRequirements: string[];
  packageId?: string;
  package?: Package;
  items: OrderItem[];
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  clinicalDiagnosis?: string;
  knownDiseases?: string;
  familyHistory?: string;
  genotype?: string;
  phenotype?: string;
  informedConsent: 'agreed' | 'not_agreed';
  contractNo?: string;
  researchProject?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerContact?: string;
}

export interface OrderFilters {
  orderNos?: string[];
  customerIds?: string[];
  sampleNos?: string[];
  productIds?: string[];
  statuses?: OrderStatus[];
  dateRange?: [string, string];
  patientName?: string;
  patientPhone?: string;
  patientId?: string;
  createdBy?: string[];
}

export interface PaginationConfig {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger: boolean;
  pageSizeOptions: string[];
}

interface OrderState {
  orders: Order[];
  filteredOrders: Order[];
  selectedRowKeys: string[];
  filters: OrderFilters;
  pagination: PaginationConfig;
  loading: boolean;
  currentOrder: Order | null;
}

interface OrderActions {
  setOrders: (orders: Order[]) => void;
  setFilteredOrders: (orders: Order[]) => void;
  setSelectedRowKeys: (keys: string[]) => void;
  setFilters: (filters: Partial<OrderFilters>) => void;
  setPagination: (pagination: Partial<PaginationConfig>) => void;
  setLoading: (loading: boolean) => void;
  setCurrentOrder: (order: Order | null) => void;
  resetFilters: () => void;
  queryOrders: () => void;
  createOrder: (order: Omit<Order, 'id' | 'orderNo' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  voidOrders: (ids: string[]) => void;
  markUrgent: (ids: string[], reason: string, type: string) => void;
}

const defaultFilters: OrderFilters = {
  statuses: ['processing', 'partially_completed', 'completed'],
  dateRange: [
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    new Date().toISOString()
  ]
};

const defaultPagination: PaginationConfig = {
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50', '100']
};

const generateOrderNo = () => {
  return 'ORD' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
};

const maskName = (name: string): string => {
  if (!name) return '';
  if (name.length <= 2) return name.slice(0, -1) + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 7) return phone;
  if (phone.length <= 4) return phone.slice(0, -1) + '*';
  return phone.slice(0, 3) + '****' + phone.slice(-4);
};

const ordersMock: Order[] = [
  {
    id: 'o1',
    orderNo: 'ORD202411120001',
    type: 'product',
    customerId: '1',
    customer: { id: '1', name: '北京协和医院', code: 'PUMCH001', country: '中国', province: '北京', region: '东城区', contractNo: 'CON2024001' },
    patientId: 'p1',
    patient: { id: 'p1', name: '张三', phone: '13812345678', idType: 'id_card', idNumber: '110101199001011234', nativePlace: '北京', birthDate: '1990-01-01T00:00:00.000Z', ageType: 'normal', age: 34, monthAge: 0, gender: 'male' },
    status: 'processing',
    priority: 'normal',
    sampleNos: ['SMP001','SMP002'],
    originalSampleNos: ['OSMP001','OSMP002'],
    sampleTypes: ['全血'],
    samplingTime: new Date().toISOString(),
    deliveryRequirements: ['线上报告'],
    items: [
      { id: 'oi1', orderId: 'o1', productId: '1', product: { id: '1', name: '全基因组测序', code: 'WGS001', type: '测序类' }, quantity: 1, unitPrice: 1000, totalPrice: 1000 }
    ],
    totalAmount: 1000,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    informedConsent: 'agreed',
    contractNo: 'CON2024001',
    researchProject: '',
    customerPhone: '',
    customerEmail: '',
    customerContact: ''
  },
  {
    id: 'o2',
    orderNo: 'ORD202411120002',
    type: 'package',
    customerId: '2',
    customer: { id: '2', name: '上海瑞金医院', code: 'RJH001', country: '中国', province: '上海', region: '黄浦区', contractNo: 'CON2024002' },
    patientId: 'p2',
    patient: { id: 'p2', name: '李四', phone: '13900001111', idType: 'id_card', idNumber: '310101199201018765', nativePlace: '上海', birthDate: '1992-01-01T00:00:00.000Z', ageType: 'normal', age: 32, monthAge: 0, gender: 'female' },
    status: 'processing',
    priority: 'normal',
    sampleNos: ['SMP010'],
    originalSampleNos: ['OSMP010'],
    sampleTypes: ['血浆'],
    samplingTime: new Date().toISOString(),
    deliveryRequirements: ['纸质报告邮寄'],
    packageId: 'pkg1',
    package: { id: 'pkg1', name: '基础健康检测套餐', code: 'BASIC001', type: '基础类', sampleCount: 1, sampleTypes: ['血浆'], products: [{ id: '2', name: '外显子组测序', code: 'WES001', type: '测序类' }] },
    items: [
      { id: 'oi2', orderId: 'o2', productId: '2', product: { id: '2', name: '外显子组测序', code: 'WES001', type: '测序类' }, quantity: 1, unitPrice: 1500, totalPrice: 1500 }
    ],
    totalAmount: 1500,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    informedConsent: 'agreed',
    contractNo: 'CON2024002',
    researchProject: '',
    customerPhone: '',
    customerEmail: '',
    customerContact: ''
  }
  ,
  {
    id: 'o3',
    orderNo: 'ORD202411120003',
    type: 'product',
    customerId: '3',
    customer: { id: '3', name: '广州中山医院', code: 'ZSH001', country: '中国', province: '广东', region: '越秀区', contractNo: 'CON2024003' },
    patientId: 'p3',
    patient: { id: 'p3', name: '王五', phone: '13700002222', idType: 'id_card', idNumber: '440101199303031234', nativePlace: '广东', birthDate: '1993-03-03T00:00:00.000Z', ageType: 'normal', age: 31, monthAge: 0, gender: 'male' },
    status: 'partially_completed',
    priority: 'normal',
    sampleNos: ['SMP020'],
    originalSampleNos: ['OSMP020'],
    sampleTypes: ['血清'],
    samplingTime: new Date().toISOString(),
    deliveryRequirements: ['线上报告'],
    items: [
      { id: 'oi3', orderId: 'o3', productId: '3', product: { id: '3', name: '肿瘤标志物检测', code: 'TMB001', type: '检测试剂' }, quantity: 1, unitPrice: 600, totalPrice: 600 }
    ],
    totalAmount: 600,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    informedConsent: 'agreed',
    contractNo: 'CON2024003',
    researchProject: '',
    customerPhone: '',
    customerEmail: '',
    customerContact: ''
  },
  {
    id: 'o4',
    orderNo: 'ORD202411120004',
    type: 'package',
    customerId: '4',
    customer: { id: '4', name: '成都华西医院', code: 'HXH001', country: '中国', province: '四川', region: '武侯区', contractNo: 'CON2024004' },
    patientId: 'p4',
    patient: { id: 'p4', name: '赵六', phone: '13600003333', idType: 'id_card', idNumber: '510101199404041234', nativePlace: '四川', birthDate: '1994-04-04T00:00:00.000Z', ageType: 'normal', age: 31, monthAge: 0, gender: 'female' },
    status: 'completed',
    priority: 'normal',
    sampleNos: ['SMP030','SMP031'],
    originalSampleNos: ['OSMP030','OSMP031'],
    sampleTypes: ['全血','血浆'],
    samplingTime: new Date().toISOString(),
    deliveryRequirements: ['纸质报告邮寄','线上报告'],
    packageId: 'pkg2',
    package: { id: 'pkg2', name: '肿瘤综合检测套餐', code: 'TUMOR001', type: '专项类', sampleCount: 2, sampleTypes: ['全血','血浆'], products: [{ id: '4', name: 'ctDNA检测', code: 'CTDNA001', type: '测序类' }] },
    items: [
      { id: 'oi4', orderId: 'o4', productId: '4', product: { id: '4', name: 'ctDNA检测', code: 'CTDNA001', type: '测序类' }, quantity: 1, unitPrice: 2000, totalPrice: 2000 }
    ],
    totalAmount: 2000,
    createdBy: 'admin',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    informedConsent: 'agreed',
    contractNo: 'CON2024004',
    researchProject: '',
    customerPhone: '',
    customerEmail: '',
    customerContact: ''
  }
]

export const useOrderStore = create<OrderState & OrderActions>()(
  persist(
    (set, get) => ({
      orders: ordersMock,
      filteredOrders: [],
      selectedRowKeys: [],
      filters: defaultFilters,
      pagination: defaultPagination,
      loading: false,
      currentOrder: null,

      setOrders: (orders) => set({ orders }),
      
      setFilteredOrders: (filteredOrders) => set({ filteredOrders }),
      
      setSelectedRowKeys: (selectedRowKeys) => set({ selectedRowKeys }),
      
      setFilters: (filters) => set((state) => ({ 
        filters: { ...state.filters, ...filters } 
      })),
      
      setPagination: (pagination) => set((state) => ({ 
        pagination: { ...state.pagination, ...pagination } 
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setCurrentOrder: (currentOrder) => set({ currentOrder }),
      
      resetFilters: () => set({ filters: defaultFilters }),
      
      queryOrders: () => {
        const { orders, filters, pagination } = get();
        let base = orders;
        if (orders.length) {
          const ids = new Set(orders.map(o => o.id));
          const merged = [...orders, ...ordersMock.filter(o => !ids.has(o.id))];
          base = merged;
          if (merged.length !== orders.length) set({ orders: merged });
        } else {
          set({ orders: ordersMock });
          base = ordersMock;
        }
        let filtered = [...base];

        // Apply filters
        if (filters.orderNos?.length) {
          filtered = filtered.filter(order => 
            filters.orderNos!.some(no => order.orderNo.includes(no))
          );
        }

        if (filters.customerIds?.length) {
          filtered = filtered.filter(order => 
            filters.customerIds!.includes(order.customerId)
          );
        }

        if (filters.sampleNos?.length) {
          filtered = filtered.filter(order => 
            order.sampleNos.some(sampleNo => 
              filters.sampleNos!.some(no => sampleNo.includes(no))
            )
          );
        }

        if (filters.productIds?.length) {
          filtered = filtered.filter(order => 
            order.items.some(item => 
              filters.productIds!.includes(item.productId)
            )
          );
        }

        if (filters.statuses?.length) {
          filtered = filtered.filter(order => 
            filters.statuses!.includes(order.status)
          );
        }

        if (filters.dateRange?.[0] && filters.dateRange?.[1]) {
          const [start, end] = filters.dateRange;
          filtered = filtered.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= new Date(start) && orderDate <= new Date(end);
          });
        }

        if (filters.patientName) {
          const searchName = filters.patientName.toLowerCase();
          filtered = filtered.filter(order => 
            order.patient.name.toLowerCase().includes(searchName)
          );
        }

        if (filters.patientPhone) {
          filtered = filtered.filter(order => 
            order.patient.phone === filters.patientPhone
          );
        }

        if (filters.patientId) {
          filtered = filtered.filter(order => 
            order.patient.id === filters.patientId
          );
        }

        if (filters.createdBy?.length) {
          filtered = filtered.filter(order => 
            filters.createdBy!.includes(order.createdBy)
          );
        }

        // Sort by createdAt desc
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Apply pagination
        const start = (pagination.current - 1) * pagination.pageSize;
        const end = start + pagination.pageSize;
        const paginated = filtered.slice(start, end);

        set({ 
          filteredOrders: paginated,
          pagination: { ...pagination, total: filtered.length }
        });
      },

      createOrder: (orderData) => {
        const newOrder: Order = {
          ...orderData,
          id: Date.now().toString(),
          orderNo: generateOrderNo(),
          status: 'processing',
          priority: 'normal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          orders: [newOrder, ...state.orders]
        }));

        return newOrder;
      },

      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map(order => 
            order.id === id 
              ? { ...order, ...updates, updatedAt: new Date().toISOString() }
              : order
          )
        }));
      },

      voidOrders: (ids) => {
        set((state) => ({
          orders: state.orders.map(order => 
            ids.includes(order.id) 
              ? { ...order, status: 'cancelled', updatedAt: new Date().toISOString() }
              : order
          ),
          selectedRowKeys: state.selectedRowKeys.filter(key => !ids.includes(key))
        }));
      },

      markUrgent: (ids, reason, type) => {
        set((state) => ({
          orders: state.orders.map(order => 
            ids.includes(order.id) 
              ? { 
                  ...order, 
                  priority: 'urgent',
                  updatedAt: new Date().toISOString()
                }
              : order
          )
        }));
      }
    }),
    {
      name: 'order-store',
      partialize: (state) => ({
        orders: state.orders,
        filters: state.filters,
        pagination: state.pagination
      })
    }
  )
);

export { maskName, maskPhone };
export type { OrderState, OrderActions };
