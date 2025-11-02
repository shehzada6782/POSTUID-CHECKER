const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to extract Facebook UID
app.post('/extract-uid', async (req, res) => {
    try {
        const { postUrl } = req.body;

        if (!postUrl) {
            return res.status(400).json({
                success: false,
                error: 'Post URL is required'
            });
        }

        // Validate Facebook URL
        if (!postUrl.includes('facebook.com') && !postUrl.includes('fb.com')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Facebook URL'
            });
        }

        // Fetch the post page
        const response = await axios.get(postUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        const html = response.data;
        let postId = null;

        // Method 1: Look for share_fbid in script tags
        const shareFbidMatch = html.match(/"share_fbid":"(\d+)"/);
        if (shareFbidMatch) {
            postId = shareFbidMatch[1];
        }

        // Method 2: Look for post ID in meta tags
        if (!postId) {
            const $ = cheerio.load(html);
            const metaOgUrl = $('meta[property="og:url"]').attr('content');
            if (metaOgUrl) {
                const urlMatch = metaOgUrl.match(/(\d+)(?:\?|$)/);
                if (urlMatch) {
                    postId = urlMatch[1];
                }
            }
        }

        // Method 3: Look for data in debug info
        if (!postId) {
            const debugMatch = html.match(/"debug_info":\{[^}]*"id":"([^"]+)"/);
            if (debugMatch) {
                try {
                    const debugInfoEncoded = debugMatch[1];
                    const debugInfoDecoded = Buffer.from(debugInfoEncoded, 'base64').toString();
                    const idMatch = debugInfoDecoded.match(/\d+/g);
                    if (idMatch && idMatch.length > 0) {
                        postId = idMatch[idMatch.length - 1];
                    }
                } catch (e) {
                    console.log('Debug info decoding failed');
                }
            }
        }

        // Method 4: Try to extract from URL parameters
        if (!postId) {
            const urlParams = new URLSearchParams(postUrl.split('?')[1]);
            const storyFbid = urlParams.get('story_fbid');
            const idParam = urlParams.get('id');
            
            if (storyFbid) {
                postId = storyFbid;
            } else if (idParam) {
                postId = idParam;
            }
        }

        if (postId) {
            res.json({
                success: true,
                postId: postId,
                fullUrl: `https://facebook.com/${postId}`,
                message: 'UID successfully extracted!'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Could not extract Post ID. Please make sure the URL is correct and the post is public.'
            });
        }

    } catch (error) {
        console.error('Error:', error.message);
        
        if (error.response) {
            res.status(error.response.status).json({
                success: false,
                error: `Facebook returned error: ${error.response.status} - ${error.response.statusText}`
            });
        } else if (error.code === 'ENOTFOUND') {
            res.status(400).json({
                success: false,
                error: 'Network error: Could not connect to Facebook'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Server error: ' + error.message
            });
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});

module.exports = app;
