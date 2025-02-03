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
      url: targetUrl, // Use the validated full URL
      headers: {
        ...req.headers,
      } as Record<string, string>,
      data: isGet ? undefined : req.body, // Include body only for non-GET requests
      responseType: 'arraybuffer', // Support binary content (images, PDFs, etc.)
    };

    // Make the request to the external HTTP server
    const response = await axios(axiosConfig);

    // Set headers for response
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    res.setHeader('Content-Length', response.headers['content-length'] || '0');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

    // Send the response back to the client
    res.status(response.status).send(Buffer.from(response.data));
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      message: 'Proxy request failed',
      error: error.response?.data || error.message,
    });
  }
}
