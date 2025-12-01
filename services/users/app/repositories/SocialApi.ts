import fetch from 'node-fetch'
import { AppError, UserStatus } from '@ft_transcendence/common'

export class SocialApi {
  static async notifyUserStatusChange(userId: string, status: UserStatus): Promise<void> {
    const base = process.env.SOCIAL_SERVICE_URL;
    const secret = process.env.SOCIAL_API_SECRET;
    if (!base || !secret)
      throw new AppError('Missing SOCIAL_SERVICE_URL or SOCIAL_API_SECRET env', 500);

    const url = `${base}/api/internal/social/broadcast-status`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': secret
    }
    const body = {
      userId: Number(userId),
      status: status,
      timestamp: new Date().toISOString()
    }
    const options = {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }

    let response
    try {
      response = await fetch(url, options)
    }
    catch (err) {
      console.error('Missing SOCIAL_SERVICE_URL or SOCIAL_API_SECRET env');
      return;
    }
    if (!response.ok) {
      console.error(`Social service HTTP ${response.status}`);
      return;
    }

    console.log(`[NOTIFY] Notified social service of status change for user ${userId} to ${status}`);
  }
}