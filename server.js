const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware to parse JSON bodies
app.use(express.json());

// Endpoint to extract UID from FB post URL
app.post('/extract', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required in request body' });
  }

  // Regex for common FB post URL patterns
  // Matches: /posts/{id}, story.php?story_fbid={id}, /{user}/{id}, etc.
  const postIdMatch = url.match(/facebook\.com\/(?:[^\/]+\/)?(?:posts\/|p\/\w+\/|story\.php\?story_fbid=)(\d+)/);

  if (postIdMatch && postIdMatch[1]) {
    return res.json({ uid: postIdMatch[1] });
  } else {
    return res.status(400).json({ error: 'Invalid Facebook post URL. Could not extract post UID.' });
  }
});

// Health check endpoint (optional, for Render)
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
