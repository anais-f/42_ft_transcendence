export interface IJwtPayload {
	user_id: number
	login: string
	is_admin?: boolean
	iat: number
	exp: number
}

export interface IWsJwtTokenQuery {
	Querystring: {
		token: string
	}
}
