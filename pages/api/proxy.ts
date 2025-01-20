import axios, { Method } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is missing or invalid' });
    }

    // Cast req.method to Axios' Method type
    const method = req.method as Method;

    // Configure the request to the external API
    const axiosConfig = {
      method,
      url,
      headers: req.headers as unknown as Record<string, string>, // Forward request headers
      data: req.body, // Include the request body for POST, PUT, etc.
    };

    // Make the request to the external endpoint
    const response = await axios(axiosConfig);

    // Forward the response to the client
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      message: 'Proxy request failed',
      error: error.response?.data || error.message,
    });
  }
};
