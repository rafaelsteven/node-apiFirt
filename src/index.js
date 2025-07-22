const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const OpenApiValidator = require('express-openapi-validator');

const app = express();
const port = 3000;

const swaggerDocument = YAML.load('./openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.json());

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

app.post('/users', (req, res) => {
  const { name, email, age, phone } = req.body;
  res.status(201).json({ id: Date.now(), name, email, age, phone });
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  if (userId !== 1) {
	return res.status(404).json({ message: 'User not found' });
  }
  return res.status(200).json({ id: userId, name: 'John Doe', email: 'john.doe@example.com', age: 30, phone: '123-456-7890' });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

