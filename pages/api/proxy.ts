import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { Method } from 'axios';
import { URL } from 'url';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false, // Important for binary streaming
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL parameter is missing or invalid' });
      return;
    }

    let targetUrl: string;
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
      targetUrl = parsedUrl.href;
    } catch {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    // Forward range headers (important for video streaming)

    // Stream response using Axios
    const response = await axios({
      method: req.method as Method,
      url: targetUrl,
      headers: {
        ...req.headers,
      } as Record<string, string>,
      responseType: 'stream', // Stream the response instead of buffering
    });

    // Set necessary headers for video playback
    res.writeHead(response.status, response.headers);

    // Pipe the response directly to the client
    response.data.pipe(res);
  } catch (error: any) {
    console.error('Proxy request failed:', error.message);

    res.status(error.response?.status || 500).json({
      message: 'Proxy request failed',
      status: error.response?.status || 500,
    });
  }
}
