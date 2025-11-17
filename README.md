# 智惠实验室系统（LIS）项目README（无 Docker 部署）

## 环境要求
- 操作系统：Windows（PowerShell）
- Node.js：建议使用 LTS（>= 18）
- 包管理器：pnpm（建议）或 npm（可选）

## 项目结构
- `lis-frontend`：前端（React + TypeScript + Vite + Ant Design + Zustand）
- `lis-backend`：后端（Express + TypeScript，使用 `tsx` 运行）
- `.trae/`：设计与架构文档（开发参考）

## 开发环境启动
- 前端开发（5173 端口）
  1. `cd lis-frontend`
  2. `pnpm install`
  3. `pnpm dev --host --port 5173`

- 后端开发（默认 3001 端口）
  1. `cd lis-backend`
  2. `pnpm install`
  3. `pnpm run server:dev`

### 前后端一起启动（单窗口）
- 使用 `concurrently` 在项目根目录一次性启动前后端（PowerShell 分别执行以下命令，无需使用 `&&`）：
  1. `cd d:\LIS`
  2. `pnpm dlx concurrently "pnpm -C lis-frontend dev --host --port 5173" "pnpm -C lis-backend run server:dev"`
- 说明：
  - 若端口被占用，前端会自动切换到其他端口（例如 5174）；后端默认 `3001`，可在 `.env` 中设置 `PORT`。
  - 如使用 npm，可替换为：`npx concurrently "npm --prefix lis-frontend run dev -- --host --port 5173" "npm --prefix lis-backend run server:dev"`
  - 如不希望安装 `dlx` 临时包，可在两个独立终端分别执行前后端启动命令。

## 生产构建与直接部署（无 Docker）
- 前端：构建并部署静态资源
  1. `cd lis-frontend`
  2. `pnpm install`
  3. `pnpm build`
  4. 构建产物位于 `lis-frontend/dist`
  5. 本地预览（可选）：`pnpm preview --port 5173`
  6. 生产部署：将 `dist` 目录部署到任意静态站点服务（IIS、Nginx、CDN 或 `pnpm dlx serve -s dist`）

- 后端：直接运行 Node 服务
  1. `cd lis-backend`
  2. `pnpm install`
  3. 在项目根或 `lis-backend` 目录创建 `.env`（示例）
     - `PORT=3001`
     - `CORS_ORIGIN=*`
  4. 直接启动（生产）：`pnpm dlx tsx api/server.ts`

## 端口与访问
- 前端开发访问：`http://localhost:5173/`
- 后端开发健康检查：`http://localhost:3001/api/health`
 - 前端默认后端地址：`http://localhost:3001`（可通过 `.env` 设置 `VITE_API_BASE_URL`）

## 注意事项
- PowerShell 不支持 `&&` 链式语法，命令请逐行执行。
- 请勿在仓库中提交任何敏感信息（密钥、账号、私密配置）。
- 完成环境搭建或测试后，请清理本地调试日志与临时测试数据，保持项目环境整洁。

## 问题排查
- 端口占用：如 5173 或 3001 被占用，请更换端口或关闭占用进程。
- 依赖安装失败：确保网络环境畅通，必要时使用国内源或重试安装。
