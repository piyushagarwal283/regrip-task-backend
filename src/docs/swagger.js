const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Management API',
      version: '1.0.0',
      description: 'Backend assignment for REGRIP INDIA PVT. LTD.',
    },
    servers: [
      { url: 'http://localhost:3000' },
    ],
  },
  apis: [], // abhi routes docs nahi diye, baad me add karenge
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
