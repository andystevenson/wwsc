import type { FC } from 'hono/jsx'

export type Tags = {
  author: string
  title: string
  description: string
  image: string
  url: string
  keywords: string[]
  icon: string
  icon180: string
  scripts: string[]
}

export const Meta: FC<Tags> = (props: Tags) => {
  const {
    title,
    description,
    image,
    keywords,
    author,
    url,
    icon,
    icon180,
    scripts,
  } = props
  return (
    <>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>{title}</title>

      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="generator" content={author} />

      <meta name="description" content={description} />

      <meta name="keywords" content={keywords.join(', ')} />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />

      <meta itemprop="name" content={title} />
      <meta itemprop="description" content={description} />
      <meta itemprop="image" content={image} />

      <meta property="og:site_name" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content={title} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      <meta name="view-transition" content="same-origin" />

      <link rel="icon" href={icon} type="image/svg+xml" />
      <link rel="apple-touch-icon" type="image/png" href={icon180} />
      {scripts.map((src) => (
        <script src={src} defer />
      ))}
    </>
  )
}

export default Meta
