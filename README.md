# Facebook Post UID Extractor

Yeh ek web application hai jo Facebook posts se UID extract karta hai.

## Features
- Facebook post URLs se UID extract karein
- User-friendly Hindi interface
- Responsive design
- Copy to clipboard functionality

## Deployment on Render

### Prerequisites
- Render account
- GitHub repository

### Deployment Steps

1. **Repository banayein:**
   - Saari files ko ek naye GitHub repository mein push karein

2. **Render par deploy karein:**
   - Render dashboard mein jayein
   - "New" button click karein aur "Web Service" choose karein
   - Apna GitHub repository connect karein
   - Deployment settings:
     - **Name:** `facebook-uid-extractor` (ya kuch aur)
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
   - "Create Web Service" click karein

3. **Environment Variables (Optional):**
   - Koi special environment variables ki zarurat nahi hai

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
