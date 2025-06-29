import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  user?: {
    claims: {
      sub: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      profile_image_url?: string;
    };
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.claims) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export const getUserId = (req: AuthRequest): string | null => {
  return req.user?.claims?.sub || null;
};
