const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const OpenApiValidator = require('express-openapi-validator');

const app = express();
const port = 3000;

const swaggerDocument = YAML.load('./openapi.yaml');
const users = [
	{ id: 1, name: 'John Doe', email: 'john.doe@example.com', age: 30, phone: '123-456-7890' },
	{ id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', age: 25, phone: '987-654-3210' },
	{ id: 3, name: 'Alice Johnson', email: 'alice.johnson@example.com', age: 28, phone: '555-555-5555' }
];
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
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
	return res.status(404).json({ message: 'User not found' });
  }
  return res.status(200).json(user);
});

app.patch('/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, age, phone } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
	return res.status(404).json({ message: 'User not found' });
  }
  Object.assign(user, { name, email, age, phone });
  return res.status(200).json(user);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

