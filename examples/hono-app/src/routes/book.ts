import { Hono } from 'hono'
import { createMiddleware } from 'hono/factory'
import * as v from 'valibot'
const book = new Hono()

book.get('/', (c) => c.text('List Books')) // GET /book

book.get('/:id', (c) => {
  // GET /book/:id
  const id = c.req.param('id')
  return c.text('Get Book: ' + id)
})

book.post('/', (c) => c.text('Create Book')) // POST /book

export default book
