# HeyGen LiveAvatar demo

Open `/next/api/mt/heygen` while running the Next.js app. The page starts a
LiveAvatar LITE sandbox session and sends typed text to the avatar.

Add these values to the local `.env.local` file in the Next.js project root:

```env
LIVEAVATAR_API_KEY=your_liveavatar_api_key
LIVEAVATAR_AVATAR_ID=your_avatar_id
LIVEAVATAR_IS_SANDBOX=true
```

The API key is read only by the server route. Do not commit `.env.local`.
