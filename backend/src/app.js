const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

function createApp() {
  const app = express();

  app.use(express.json());

  if (env.frontendOrigin) {
    app.use(
      cors({
        origin: env.frontendOrigin,
        methods: ['GET', 'POST', 'OPTIONS'],
        optionsSuccessStatus: 200
      })
    );
  }

  app.use(routes);

  if (fs.existsSync(env.frontendDist)) {
    app.use(express.static(env.frontendDist));

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
        next();
        return;
      }

      res.sendFile(path.join(env.frontendDist, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};
