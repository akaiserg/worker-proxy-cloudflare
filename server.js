const express = require('express');
const path = require('path');

const app = express();
const PORT = 6000;

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [Server1] ${req.method} ${req.url}`);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server 1 is running on http://localhost:${PORT}`);
});