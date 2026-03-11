export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pin } = req.body;
  const validPin = process.env.APP_PIN;

  if (!validPin) {
    return res.status(500).json({ error: 'PIN not configured' });
  }

  if (pin === validPin) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ error: 'Invalid PIN' });
  }
}
