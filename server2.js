const express = require('express');
const path = require('path');

const app2 = express();
const PORT2 = 4000;

app2.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] [Server2] ${req.method} ${req.url}`);
  next();
});

app2.use(express.static(path.join(__dirname, 'public2')));

app2.listen(PORT2, () => {
  console.log(`Server 2 is running on http://localhost:${PORT2}`);
}); 