import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

// https://vite.dev/config/
export default defineConfig({
  appType: 'spa',
  build: {
    sourcemap: 'hidden',
  },
   server: {
    // 允许的主机列表，添加 lis.erikwang.online
    allowedHosts: ['lis.erikwang.online', 'localhost', '127.0.0.1'],
    // 保持你原本的启动参数（--host --port 5173），也可以在这里配置（二选一即可）
    host: true, // 等价于 --host，允许外部访问
    port: 5173, // 等价于 --port 5173，指定端口
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }), 
    tsconfigPaths()
  ],
})
