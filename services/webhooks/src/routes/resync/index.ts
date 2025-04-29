import { factory } from '../../hono'

const resync = factory.createApp()

resync.get('/', async (c) => {
  return c.html('<h1>Resync</h1>')
})

export default resync
