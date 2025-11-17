/**
 * This is a API server
 */

/**
 * 功能描述：Express 应用主入口，注册全局中间件与业务路由，并提供健康检查与错误处理
 * 参数说明：无显式入参；模块内部初始化配置
 * 返回值类型及用途：
 *  - 导出 app（Express.Application），供 server.ts 启动服务
 */
import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import permissionRoutes from './routes/permissions.js'
import roleRoutes from './routes/roles.js'
import userRoutes from './routes/users.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

/**
 * 功能描述：注册通用中间件（CORS、JSON解析、URL编码）
 * 参数说明：无
 * 返回值类型及用途：无；用于提升API服务兼容性
 */
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/permissions', permissionRoutes)
app.use('/api/roles', roleRoutes)
app.use('/api/users', userRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    // 功能：返回健康状态；参数：无；返回：{ success, message }
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 * 功能描述：统一错误处理，避免未捕获异常导致泄露
 * 参数说明：
 *  - error：Error对象
 *  - req/res/next：Express上下文
 * 返回值类型及用途：
 *  - JSON：500错误输出
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 * 功能：处理未匹配的API路径；返回404 JSON
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
