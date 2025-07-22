const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const OpenApiValidator = require('express-openapi-validator');

const app = express();
const port = 3000;

const swaggerDocument = YAML.load('./openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(OpenApiValidator.middleware({
	apiSpec:swaggerDocument,
	validateRequests: true,
	validateResponses: true,
	ignorePaths: /.*\/api-docs.*/,
}))


app.use(( error, req, res, next)=>{
	res.status(error.status || 500).json({
		message: error.message,
		error: error.errors
	})
	
});
app.get('/hello', (req, res) => {
  res.json({ message: 'Hello Rafael' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

