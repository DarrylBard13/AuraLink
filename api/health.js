export default function handler(req, res) {
  // Health check endpoint
  res.status(200).json({
    status: 'healthy',
    service: 'AuraLink API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}