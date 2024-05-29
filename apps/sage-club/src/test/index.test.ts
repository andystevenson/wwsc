import { describe, test, expect } from 'bun:test'
import app from '../app'
describe('Example', () => {
  test('GET /posts', async () => {
    const res = await app.request('/hello')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      message: 'Hello Hono!',
    })
  })
})
