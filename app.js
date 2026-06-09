const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const app = express();

// helmet CSP relaxed for Swagger UI inline scripts/styles
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://a.espncdn.com', 'https://resources.premierleague.com'],
      },
    },
  })
);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Swagger UI ??served at /api-docs
const swaggerDoc = YAML.load('./openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// API routers
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/teams',     require('./routes/teams'));
app.use('/api/players',   require('./routes/players'));
app.use('/api/seasons',   require('./routes/seasons'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/news',      require('./routes/news'));

module.exports = app;
