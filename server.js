const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`服务器运行在端口 ${port}`);
});