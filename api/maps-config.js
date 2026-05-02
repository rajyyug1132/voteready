export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || 'https://voteready-pi.vercel.app');
  res.setHeader('Cache-Control', 'public, max-age=3600');

  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) {
    return res.status(500).json({ error: 'Maps key not configured.' });
  }
  return res.status(200).json({ key });
}