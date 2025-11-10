import { jest } from '@jest/globals'

const signSpy: jest.MockedFunction<(payload: any, secret: string, opts: any) => string> = jest.fn()
const verifySpy: jest.MockedFunction<(token: string, secret: string) => any> = jest.fn()

await jest.unstable_mockModule('jsonwebtoken', () => ({
  __esModule: true,
  default: { sign: signSpy, verify: verifySpy },
  sign: signSpy,
  verify: verifySpy
}))

const { signToken, verifyToken } = await import('./jwt.js')

describe('jwt utils', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    delete process.env.JWT_SECRET
  })

  test('signToken throws if JWT_SECRET missing', () => {
    expect(() => signToken({ user_id: 1, login: 'alice' })).toThrow(/JWT_SECRET/)
  })

  test('signToken signs with secret', () => {
    process.env.JWT_SECRET = 's3cr3t'
    signSpy.mockReturnValue('signed.jwt')
    const token = signToken({ user_id: 2, login: 'bob', is_admin: true })
    expect(token).toBe('signed.jwt')
    expect(signSpy).toHaveBeenCalledWith({ user_id: 2, login: 'bob', is_admin: true }, 's3cr3t', expect.objectContaining({ expiresIn: '1h' }))
  })

  test('verifyToken throws if JWT_SECRET missing', () => {
    expect(() => verifyToken('abc')).toThrow(/JWT_SECRET/)
  })

  test('verifyToken returns decoded payload', () => {
    process.env.JWT_SECRET = 's3cr3t'
    verifySpy.mockReturnValue({ user_id: 3, login: 'carol', is_admin: false, iat: 1, exp: 2 })
    const decoded = verifyToken('token.jwt')
    expect(decoded.login).toBe('carol')
    expect(verifySpy).toHaveBeenCalledWith('token.jwt', 's3cr3t')
  })
})
