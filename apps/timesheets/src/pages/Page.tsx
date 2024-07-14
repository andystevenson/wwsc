import type { FC } from 'hono/jsx'
import Meta, { type Tags } from './Meta'

export type PageProps = {
  tags: Tags
  children?: JSX.Element[]
}

export const Page: FC<PageProps> = ({ tags, children }) => {
  return (
    <html lang="en">
      <head>
        <Meta {...tags} />
      </head>
      <body>{children}</body>
    </html>
  )
}

export { Meta, Tags }
