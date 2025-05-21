// src/config/swaggerDef.js

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Parking Management System API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Vehicle Parking Management System backend. To use protected endpoints:\n1. Login using /api/auth/login to get a token\n2. Click the "Authorize" button above\n3. Enter your token (without "Bearer " prefix)\n4. Click "Authorize"',
    },
    servers: [
      {
        url: 'http://localhost:5000/api', // Your server URL
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: <token> (without "Bearer " prefix)',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Files to search for Swagger comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 