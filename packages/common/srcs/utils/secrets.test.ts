import { jest } from '@jest/globals'

const readFileSyncMock: jest.MockedFunction<(path: string, enc: any) => string> = jest.fn()
await jest.unstable_mockModule('fs', () => ({
  __esModule: true,
  readFileSync: readFileSyncMock
}))

const { readSecret } = await import('./secrets.js')

describe('common readSecret util', () => {
  beforeEach(() => jest.resetAllMocks())

  test('returns trimmed content when file exists', () => {
    readFileSyncMock.mockReturnValue(' value-with-space \n' as any)
    const res = readSecret('my_secret')
    expect(readFileSyncMock).toHaveBeenCalledWith('/run/secrets/my_secret', 'utf8')
    expect(res).toBe('value-with-space')
  })

  test('returns undefined when file missing', () => {
    readFileSyncMock.mockImplementation(() => { throw new Error('ENOENT') })
    const res = readSecret('missing')
    expect(res).toBeUndefined()
  })
})
