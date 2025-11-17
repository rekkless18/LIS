import { RouterProvider } from "react-router-dom";
import router from "@/router";

/**
 * 应用根组件
 * 功能：提供统一的路由入口，加载集中配置的路由树与布局
 * 参数：无
 * 返回值：React.ReactElement，用于渲染整个前端应用
 * 用途：作为应用入口，与 RouterProvider 配合渲染 Layout、Header、Sidebar 及各页面
 */
export default function App(): React.ReactElement {
  return <RouterProvider router={router} />;
}
