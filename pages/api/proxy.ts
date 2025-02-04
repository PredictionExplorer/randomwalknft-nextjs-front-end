import axios, { AxiosRequestConfig, Method } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { URL } from 'url';

export const config = {
  api: {
    responseLimit: false, // Allow large responses
    bodyParser: false, // Prevent Next.js from parsing request bodies (important for binary data)
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      res.status(400).json({ error: 'URL parameter is missing or invalid' });
      return;
    }

    // Ensure the URL is correctly formatted
    let targetUrl: string;
    try {
      const parsedUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
      targetUrl = parsedUrl.href; // Get the full URL with protocol
    } catch {
      res.status(400).json({ error: 'Invalid URL format' });
      return;
    }

    const method: Method = req.method as Method;
    const isGet = method === 'GET';

    // Configure Axios request
    const axiosConfig: AxiosRequestConfig = {
      method,
      url: targetUrl,
      headers: { ...req.headers } as Record<string, string>,
      data: isGet ? undefined : req.body,
      responseType: 'stream', // Use stream to dynamically handle response type
    };

    const response = await axios(axiosConfig);

    // Determine Content-Type
    const contentType = response.headers['content-type'] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);

    if (contentType.includes('application/json')) {
      // If JSON, parse the response and send JSON
      let responseData = '';
      response.data.on('data', (chunk: Buffer) => {
        responseData += chunk.toString();
      });

      response.data.on('end', () => {
        res.status(response.status).json(JSON.parse(responseData));
      });
    } else {
      // Otherwise, stream the binary response
      response.data.pipe(res);
    }
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      message: 'Proxy request failed',
      error: error.response?.data || error.message,
    });
  }
}
