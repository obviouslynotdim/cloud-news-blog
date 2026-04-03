const express = require('express');
const app = express();
const port = Number(process.env.PORT) || 3000;

app.get('/', (req, res) => {
  res.status(200).send('Hello from Cloud-News-Blog!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'cloud-news-blog' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});