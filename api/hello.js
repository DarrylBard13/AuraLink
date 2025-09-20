export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from AuraLink API!',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url
  });
}