import type { FC, JSX } from 'hono/jsx'
import Meta, { type Tags } from './Meta'

export type PageProps = {
  tags: Tags
  children?: JSX.Element[]
  bodyClass?: string
}

export const Page: FC<PageProps> = ({ tags, children, bodyClass }) => {
  return (
    <html lang="en">
      <head>
        <Meta {...tags} />
      </head>
      <body class={bodyClass}>{children}</body>
    </html>
  )
}

export { Meta, Tags }
