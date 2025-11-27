const express = require('express');
const path = require('path');
const app = express();
const controllers = require('./mvc/controllers/controladores');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'mvc/public')));
app.use('/api', controllers);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'mvc/public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});