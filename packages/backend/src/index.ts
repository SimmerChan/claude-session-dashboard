import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(compression());
app.use(express.json());

// 静态文件服务（前端构建产物）
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
