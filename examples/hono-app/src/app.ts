import { Hono } from 'hono'
import { streamText } from 'hono/streaming'
import { logger } from 'hono/logger'

import book from './routes/book'
import page from './page'

const app = new Hono()
app.use(logger())

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/stream', (c) => {
  return streamText(c, async (stream) => {
    for (let i = 0; i < 5; i++) {
      // Write a text with a new line ('\n').
      await stream.writeln(`Hello ${i}`)
      // Wait 1 second.
      await stream.sleep(1000)
      // Write a text without a new line.
      await stream.write(`Hono!`)
    }
  })
})

app.get('/hello', (c) => {
  return c.json({ message: 'Hello Hono!' })
})

app.route('/book', book)
app.route('/page', page)

export default app
