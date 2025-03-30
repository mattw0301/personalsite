require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const transfersHandler = require('./api/transfers');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/transfers', (req, res) => {
  transfersHandler(req, res);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});