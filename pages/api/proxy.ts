import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { Method, AxiosRequestConfig } from 'axios';
import { URL } from 'url';

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
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

    const axiosConfig: AxiosRequestConfig = {
      method: req.method as Method,
      url: targetUrl,
      headers: {
        ...req.headers,
        host: new URL(targetUrl).host,
      } as unknown as Record<string, string>,
      responseType: 'stream',
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      axiosConfig.data = req; // forward the body stream
    }

    const response = await axios(axiosConfig);

    res.writeHead(response.status, response.headers);
    response.data.pipe(res);
  } catch (error: any) {
    console.error('Proxy request failed:', error.message);
    res.status(error.response?.status || 500).json({
      message: 'Proxy request failed',
      status: error.response?.status || 500,
    });
  }
}
