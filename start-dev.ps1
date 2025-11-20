Param()
$frontend = 'pnpm -C lis-frontend dev --host --port 5173'
$backend = 'pnpm -C lis-backend run server:dev'
$pnpm = Get-Command pnpm -ErrorAction SilentlyContinue
if ($pnpm) {
  pnpm dlx concurrently $frontend $backend
} else {
  npx concurrently "npm --prefix lis-frontend run dev -- --host --port 5173" "npm --prefix lis-backend run server:dev"
}