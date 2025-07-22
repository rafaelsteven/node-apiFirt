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

const products = [
	{
		id: 1,
		name: 'iPhone 15 Pro',
		description: 'Latest Apple smartphone with titanium design',
		category: 'electronics',
		price: 999.99,
		inStock: true,
		tags: ['smartphone', 'apple', 'premium'],
		specifications: {
			'brand': 'Apple',
			'storage': '256GB',
			'color': 'Natural Titanium'
		},
		ratings: [
			{ score: 5, comment: 'Excellent phone!' },
			{ score: 4, comment: 'Great camera quality' }
		]
	},
	{
		id: 2,
		name: 'Nike Air Max 90',
		description: 'Classic running shoes with Air Max technology',
		category: 'clothing',
		price: 120.00,
		inStock: true,
		tags: ['shoes', 'nike', 'running'],
		specifications: {
			'brand': 'Nike',
			'size': '42',
			'color': 'White/Black'
		},
		ratings: [
			{ score: 4, comment: 'Very comfortable' }
		]
	},
	{
		id: 3,
		name: 'The Great Gatsby',
		description: 'Classic American literature novel',
		category: 'books',
		price: 15.99,
		inStock: false,
		tags: ['literature', 'classic', 'fiction'],
		specifications: {
			'author': 'F. Scott Fitzgerald',
			'pages': '180',
			'publisher': 'Scribner'
		},
		ratings: [
			{ score: 5, comment: 'Timeless masterpiece' },
			{ score: 4, comment: 'Great storytelling' }
		]
	}
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
app.get('/v1/hello', (req, res) => {
  res.json({ message: 'Hello Rafael' });
});
app.get('/v2/hello', (req, res) => {
  res.json({ message: 'Hello Rafael', version: 'v2' , timestamp: new Date().toISOString() });
});
app.post('/v1/users', (req, res) => {
  const { name, email, age, phone } = req.body;
  res.status(201).json({ id: Date.now(), name, email, age, phone });
});

app.get('/v1/users/:id', (req, res) => {
  const userId = req.params.id;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
	return res.status(404).json({ message: 'User not found' });
  }
  return res.status(200).json(user);
});

app.patch('/v1/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, age, phone } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
	return res.status(404).json({ message: 'User not found' });
  }
  Object.assign(user, { name, email, age, phone });
  return res.status(200).json(user);
});

// PRODUCTS ENDPOINTS

// GET /products - Obtener todos los productos con filtros opcionales
app.get('/v1/products', (req, res) => {
  let filteredProducts = [...products];
  
  // Filtrar por categoría
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(p => p.category === req.query.category);
  }
  
  // Filtrar por stock
  if (req.query.inStock !== undefined) {
    const inStock = req.query.inStock === 'true';
    filteredProducts = filteredProducts.filter(p => p.inStock === inStock);
  }
  
  // Filtrar por precio mínimo
  if (req.query.minPrice) {
    const minPrice = parseFloat(req.query.minPrice);
    filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
  }
  
  // Filtrar por precio máximo
  if (req.query.maxPrice) {
    const maxPrice = parseFloat(req.query.maxPrice);
    filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
  }
  
  res.status(200).json(filteredProducts);
});

// POST /products - Crear un nuevo producto
app.post('/v1/products', (req, res) => {
  const { name, description, category, price, inStock = true, tags = [], specifications = {} } = req.body;
  
  const newProduct = {
    id: Date.now(), // Generar ID único
    name,
    description,
    category,
    price,
    inStock,
    tags,
    specifications,
    ratings: []
  };
  
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// GET /products/:id - Obtener producto por ID
app.get('/v1/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  
  res.status(200).json(product);
});

// PUT /products/:id - Actualizar completamente un producto
app.put('/v1/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  
  const { name, description, category, price, inStock, tags = [], specifications = {} } = req.body;
  
  const updatedProduct = {
    id: productId,
    name,
    description,
    category,
    price,
    inStock,
    tags,
    specifications,
    ratings: products[productIndex].ratings // Mantener ratings existentes
  };
  
  products[productIndex] = updatedProduct;
  res.status(200).json(updatedProduct);
});

// PATCH /products/:id - Actualizar parcialmente un producto
app.patch('/v1/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  
  const updatedFields = {};
  const { name, description, category, price, inStock, tags, specifications } = req.body;
  
  // Solo actualizar campos que se proporcionaron
  if (name !== undefined) updatedFields.name = name;
  if (description !== undefined) updatedFields.description = description;
  if (category !== undefined) updatedFields.category = category;
  if (price !== undefined) updatedFields.price = price;
  if (inStock !== undefined) updatedFields.inStock = inStock;
  if (tags !== undefined) updatedFields.tags = tags;
  if (specifications !== undefined) updatedFields.specifications = specifications;
  
  // Actualizar el producto
  Object.assign(products[productIndex], updatedFields);
  
  res.status(200).json(products[productIndex]);
});

// DELETE /products/:id - Eliminar un producto
app.delete('/v1/products/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const productIndex = products.findIndex(p => p.id === productId);
  
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  
  products.splice(productIndex, 1);
  res.status(204).send(); // 204 No Content para DELETE exitoso
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log (`http://localhost:${port}/v1`);
  console.log (`http://localhost:${port}/v2`);
});

