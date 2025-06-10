import axios, { isAxiosError } from 'axios';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const {
  GITHUB_CLIENT_ID: clientId,
  GITHUB_CLIENT_SECRET: clientSecret,
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: jwtExpiresIn,
} = process.env;

export class AuthController {
  auth = async (req: Request, res: Response) => {
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}`;
    res.redirect(redirectUrl);
  };

  authCallback = async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      if (!code) {
        return res.status(400).json({ error: 'Code not provided' });
      }

      const accessTokenResult = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: clientId,
          client_secret: clientSecret,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!accessTokenResult.data.access_token) {
        return res
          .status(400)
          .json({ error: 'Failed to retrieve access token' });
      }

      const userInfoResult = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessTokenResult.data.access_token}`,
        },
      });

      const { node_id: id, avatar_url: avatar, name } = userInfoResult.data;

      const token = jwt.sign({ id, avatar, name }, jwtSecret as string, {
        expiresIn: Number(jwtExpiresIn),
      });

      res.json({
        id,
        avatar,
        name,
        token,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        return res
          .status(500)
          .json({ error: error.message, details: error.response?.data });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
