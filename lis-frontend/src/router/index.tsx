import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import EnvironmentManage from '@/pages/EnvironmentManage';
import EquipmentManage from '@/pages/EquipmentManage';
import OrderQuery from '@/pages/order/Query';
import ProductNew from '@/pages/order/ProductNew';
import PackageNew from '@/pages/order/PackageNew';
import ProductEdit from '@/pages/order/ProductEdit';
import PackageEdit from '@/pages/order/PackageEdit';
import ProductDetail from '@/pages/order/ProductDetail';
import PackageDetail from '@/pages/order/PackageDetail';
import LogisticsQuery from '@/pages/logistics/Query';
import SamplesQuery from '@/pages/samples/Query';
import SampleReceive from '@/pages/samples/Receive';
import SampleProgress from '@/pages/order/SampleProgress';
import DeliveryDownload from '@/pages/order/DeliveryDownload';
import ReportPreview from '@/pages/order/ReportPreview';
import ReportGenerate from '@/pages/report/Generate';
import ReportAudit from '@/pages/report/Audit';
import ReportQuery from '@/pages/report/Query';
import ReportException from '@/pages/report/Exception';
import InventoryQuery from '@/pages/inventory/Query';
import ApprovalQuery from '@/pages/approval/Query';
import ReportConfig from '@/pages/config/ReportConfig';
import TechRouteConfig from '@/pages/config/TechRouteConfig';
import ExperimentConfig from '@/pages/config/ExperimentConfig';
import ApprovalConfig from '@/pages/config/ApprovalConfig';
import PackageConfig from '@/pages/config/PackageConfig';
import ProductConfig from '@/pages/config/ProductConfig';
import TestItemConfig from '@/pages/config/TestItemConfig';
import CustomerConfig from '@/pages/config/CustomerConfig';
import GlobalConfig from '@/pages/system/GlobalConfig';
import UserConfig from '@/pages/permission/UserConfig';
import RoleConfig from '@/pages/permission/RoleConfig';
import Routine from '@/pages/test/Routine';
import RoutineException from '@/pages/test/RoutineException';
import TechRouteConfirm from '@/pages/test/TechRouteConfirm';
import SpecialPreprocess from '@/pages/test/SpecialPreprocess';
import SpecialSequencing from '@/pages/test/SpecialSequencing';
import SpecialBioinfo from '@/pages/test/SpecialBioinfo';
import SpecialPreRun from '@/pages/test/SpecialPreRun';
import SpecialQPCR from '@/pages/test/SpecialQPCR';
import SpecialAudit from '@/pages/test/SpecialAudit';
import SpecialException from '@/pages/test/SpecialException';
import MsExperiment from '@/pages/test/MsExperiment';
import MsAudit from '@/pages/test/MsAudit';
import MsException from '@/pages/test/MsException';

interface RouteMeta {
  title: string;
  permission?: string;
  roles?: string[];
  noAuth?: boolean;
  keepAlive?: boolean;
  hidden?: boolean;
}

interface RouteConfig {
  path: string;
  element: React.ReactNode;
  meta?: RouteMeta;
  children?: RouteConfig[];
}

const routes: RouteConfig[] = [
  {
    path: '/login',
    element: <Login />,
    meta: {
      title: '登录',
      noAuth: true
    }
  },
  {
    path: '/',
    element: <Layout />,
    meta: {
      title: '根'
    },
    children: [
      {
        path: '',
        element: <Home />,
        meta: {
          title: '首页'
        }
      },
      {
        path: 'home',
        element: <Home />,
        meta: {
          title: '首页',
          permission: 'home.view'
        }
      },
      {
        path: 'order',
        element: <Outlet />,
        meta: {
          title: '订单管理'
        },
        children: [
          {
            path: '',
            element: <Navigate to="/order/orderquery" replace />,
            meta: {
              title: '订单查询'
            }
          },
          {
            path: 'orderquery',
            element: <OrderQuery />,
            meta: {
              title: '订单查询'
            }
          },
          {
            path: 'sample',
            element: <SampleProgress />,
            meta: {
              title: '样本进度查询'
            }
          },
          {
            path: 'delivery',
            element: <DeliveryDownload />,
            meta: {
              title: '交付下载'
            }
          },
          {
            path: 'report/:id/preview',
            element: <ReportPreview />,
            meta: {
              title: '报告预览'
            }
          },
          {
            path: 'product/new',
            element: <ProductNew />,
            meta: {
              title: '新建产品订单'
            }
          },
          {
            path: 'package/new',
            element: <PackageNew />,
            meta: {
              title: '新建套餐订单'
            }
          },
          {
            path: 'product/:id/edit',
            element: <ProductEdit />,
            meta: {
              title: '编辑产品订单'
            }
          },
          {
            path: 'package/:id/edit',
            element: <PackageEdit />,
            meta: {
              title: '编辑套餐订单'
            }
          },
          {
            path: 'product/:id',
            element: <ProductDetail />,
            meta: {
              title: '产品订单详情'
            }
          },
          {
            path: 'package/:id',
            element: <PackageDetail />,
            meta: {
              title: '套餐订单详情'
            }
          }
        ]
      },
      {
        path: 'logistics',
        element: <Outlet />,
        meta: {
          title: '物流管理'
        },
        children: [
          {
            path: '',
            element: <Navigate to="/logistics/logisticsquery" replace />,
            meta: { title: '物流查询' }
          },
          {
            path: 'logisticsquery',
            element: <LogisticsQuery />,
            meta: { title: '物流查询' }
          }
        ]
      },
      {
        path: 'inventory',
        element: <Outlet />,
        meta: { title: '库存管理' },
        children: [
          { path: '', element: <Navigate to="/inventory/inventoryquery" replace />, meta: { title: '库存查询' } },
          { path: 'inventoryquery', element: <InventoryQuery />, meta: { title: '库存查询' } }
        ]
      },
      {
        path: 'approval',
        element: <Outlet />,
        meta: { title: '审批管理' },
        children: [
          { path: '', element: <Navigate to="/approval/approvalquery" replace />, meta: { title: '审批查询' } },
          { path: 'approvalquery', element: <ApprovalQuery />, meta: { title: '审批查询' } }
        ]
      },
      {
        path: 'system',
        element: <Outlet />,
        meta: { title: '系统管理' },
        children: [
          { path: 'global', element: <GlobalConfig />, meta: { title: '全局配置' } }
        ]
      },
      {
        path: 'permission',
        element: <Outlet />,
        meta: { title: '权限管理' },
        children: [
          { path: 'user', element: <UserConfig />, meta: { title: '用户配置' } },
          { path: 'role', element: <RoleConfig />, meta: { title: '角色配置' } }
        ]
      },
      {
        path: 'config',
        element: <Outlet />,
        meta: { title: '后台管理' },
        children: [
          { path: 'configpackage', element: <PackageConfig />, meta: { title: '套餐配置' } },
          { path: 'configproduct', element: <ProductConfig />, meta: { title: '产品配置' } },
          { path: 'configtest-item', element: <TestItemConfig />, meta: { title: '检测项配置' } },
          { path: 'configcustomer', element: <CustomerConfig />, meta: { title: '客户配置' } },
          { path: 'configreport', element: <ReportConfig />, meta: { title: '报告配置' } },
          { path: 'configtech-route', element: <TechRouteConfig />, meta: { title: '特检技术路线配置' } },
          { path: 'configexperiment', element: <ExperimentConfig />, meta: { title: '实验配置' } },
          { path: 'configapproval', element: <ApprovalConfig />, meta: { title: '审批配置' } }
        ]
      },
      {
        path: 'samples',
        element: <Outlet />,
        meta: {
          title: '样本管理'
        },
        children: [
          {
            path: '',
            element: <Navigate to="/samples/samplesquery" replace />,
            meta: { title: '样本查询' }
          },
          {
            path: 'samplesquery',
            element: <SamplesQuery />,
            meta: { title: '样本查询' }
          },
          {
            path: 'receive',
            element: <SampleReceive />,
            meta: { title: '样本接收' }
          }
        ]
      },
      {
        path: 'test',
        element: <Outlet />,
        meta: { title: '实验管理' },
        children: [
          {
            path: '',
            element: <Navigate to="/test/routine/routineexperiment" replace />,
            meta: { title: '普检实验' }
          },
          {
            path: 'routine/routineexperiment',
            element: <Routine />,
            meta: { title: '普检实验', permission: 'test.routine' }
          },
          {
            path: 'routine/routineexception',
            element: <RoutineException />,
            meta: { title: '普检异常处理', permission: 'test.routine.exception' }
          },
          {
            path: 'routine/exception',
            element: <RoutineException />,
            meta: { title: '普检异常处理', permission: 'test.routine.exception' }
          },
          {
            path: 'special',
            element: <Outlet />,
            meta: { title: '特检' },
            children: [
              {
                path: 'tech-route',
                element: <TechRouteConfirm />,
                meta: { title: '技术路线确认', permission: 'test.special.techroute' }
              },
              {
                path: 'preprocess',
                element: <SpecialPreprocess />,
                meta: { title: '预处理', permission: 'test.special.preprocess' }
              },
              {
                path: 'pre-run',
                element: <SpecialPreRun />,
                meta: { title: '上机前处理', permission: 'test.special.prerun' }
              },
              {
                path: 'sequencing',
                element: <SpecialSequencing />,
                meta: { title: '测序上机', permission: 'test.special.sequencing' }
              },
              {
                path: 'bioinfo',
                element: <SpecialBioinfo />,
                meta: { title: '生信分析', permission: 'test.special.bioinfo' }
              },
              {
                path: 'qpcr',
                element: <SpecialQPCR />,
                meta: { title: 'QPCR分析', permission: 'test.special.qpcr' }
              },
              {
                path: 'specialaudit',
                element: <SpecialAudit />,
                meta: { title: '特检数据审核', permission: 'test.special.audit' }
              },
              {
                path: 'specialexception',
                element: <SpecialException />,
                meta: { title: '特检异常处理', permission: 'test.special.exception' }
              }
            ]
          }
          ,
          {
            path: 'ms',
            element: <Outlet />,
            meta: { title: '质谱' },
            children: [
              {
                path: 'msexperiment',
                element: <MsExperiment />,
                meta: { title: '质谱实验', permission: 'test.ms.experiment' }
              },
              {
                path: 'msaudit',
                element: <MsAudit />,
                meta: { title: '质谱数据审核', permission: 'test.ms.audit' }
              },
              {
                path: 'msexception',
                element: <MsException />,
                meta: { title: '质谱异常处理', permission: 'test.ms.exception' }
              }
            ]
          }
        ]
      },
  {
    path: 'report',
    element: <Outlet />,
    meta: { title: '报告管理' },
    children: [
      { path: '', element: <Navigate to="/report/generate" replace />, meta: { title: '报告生成' } },
      { path: 'generate', element: <ReportGenerate />, meta: { title: '报告生成' } },
      { path: 'audit', element: <ReportAudit />, meta: { title: '报告审核' } },
      { path: 'query', element: <ReportQuery />, meta: { title: '报告查询' } },
      { path: 'exception', element: <ReportException />, meta: { title: '报告异常处理' } }
    ]
  },
      {
        path: 'labmanage/environmentmanage',
        element: <EnvironmentManage />,
        meta: {
          title: '环境管理'
        }
      },
      {
        path: 'labmanage/equipmentmanage',
        element: <EquipmentManage />,
        meta: {
          title: '设备管理'
        }
      }
    ]
  },
  {
    path: '/403',
    element: <div>403 - 无权限</div>,
    meta: {
      title: '无权限'
    }
  },
  {
    path: '/404',
    element: <div>404 - 页面不存在</div>,
    meta: {
      title: '页面不存在'
    }
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
    meta: {
      title: '重定向首页'
    }
  }
];

const router = createBrowserRouter(
  routes.map(route => ({
    ...route,
    element: route.element
  }))
);

export default router;
export type { RouteConfig, RouteMeta };
