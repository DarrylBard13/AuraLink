// Single API handler with internal routing
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse URL path
  const { url, method } = req;
  const urlParts = url.split('?')[0].split('/');
  const endpoint = urlParts[urlParts.length - 1] || 'index';

  console.log(`API Request: ${method} ${url} -> endpoint: ${endpoint}`);

  try {
    // Route to different handlers based on endpoint
    switch (endpoint) {
      case 'index':
      case '':
        return handleIndex(req, res);

      case 'bills':
        return handleBills(req, res);

      case 'users':
        return handleUsers(req, res);

      case 'upload':
        return handleUpload(req, res);

      case 'test':
      case 'hello':
        return handleTest(req, res);

      default:
        return res.status(404).json({
          error: 'Endpoint not found',
          endpoint,
          availableEndpoints: ['index', 'bills', 'users', 'upload', 'test']
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      endpoint
    });
  }
}

// Handler functions
function handleIndex(req, res) {
  return res.status(200).json({
    message: 'AuraLink API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      '/api/index': 'API information',
      '/api/bills': 'Bills CRUD operations',
      '/api/users': 'User authentication',
      '/api/upload': 'File upload',
      '/api/test': 'Simple test endpoint'
    }
  });
}

function handleBills(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return res.status(200).json([
        {
          id: 1,
          name: 'Electric Bill',
          amount: 150.00,
          dueDate: '2025-01-15',
          status: 'pending',
          category: 'Utilities'
        },
        {
          id: 2,
          name: 'Internet',
          amount: 79.99,
          dueDate: '2025-01-10',
          status: 'paid',
          category: 'Utilities'
        }
      ]);

    case 'POST':
      const newBill = {
        id: Date.now(),
        ...req.body,
        created_date: new Date().toISOString()
      };
      return res.status(201).json(newBill);

    case 'PUT':
      return res.status(200).json({
        id: req.query.id || Date.now(),
        ...req.body,
        updated_date: new Date().toISOString()
      });

    case 'DELETE':
      return res.status(200).json({ success: true });

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleUsers(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return res.status(200).json({
        id: 1,
        email: 'user@example.com',
        full_name: 'Demo User',
        preferred_name: 'Demo',
        role: 'admin',
        backup_email: '',
        created_date: '2025-01-01T00:00:00.000Z'
      });

    case 'PUT':
      return res.status(200).json({
        id: 1,
        ...req.body,
        updated_date: new Date().toISOString()
      });

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

function handleUpload(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const fileId = Date.now() + Math.random().toString(36).substr(2, 9);
  const mockFileUrl = `https://mock-storage.vercel.app/uploads/${fileId}`;

  return res.status(200).json({
    file_url: mockFileUrl,
    file_id: fileId,
    success: true,
    message: 'File uploaded successfully'
  });
}

function handleTest(req, res) {
  return res.status(200).json({
    message: 'API test endpoint working!',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
}
