export interface IJwtPayload {
  user_id: number
  login: string
  is_admin?: boolean
  iat: number
  exp: number
}

