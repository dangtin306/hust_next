# HeyGen Video API demo

Open `/next/api/mt/media/heygen` while running the Next.js app. The page accepts
a short script, a saved avatar or public HTTPS photo, and a voice, then creates
a video and checks its render status.

Configure these values in `backend/node_js/.env` and restart the Node.js backend:

```env
HEYGEN_API_KEY=your_heygen_api_key
HEYGEN_API_ACCESS_TOKEN=your_private_random_token
```

Enter `HEYGEN_API_ACCESS_TOKEN` in the demo page. The HeyGen API key remains in
Node.js and is not sent to the browser. The Next.js server proxies to
`http://127.0.0.1:8818` by default; set `HEYGEN_NODE_API_URL` in the Next.js
server environment when Node.js runs at another address.

Creating a video is a billable action; loading avatars/voices and checking a
video status do not submit a generation request.