const apiKey = process.env.GETADDRESS_API_KEY

type Postcode = {
  latitude: number
  longitude: number
  addresses: string[]
}

async function find(
  postcode: string,
  format?: string,
  sort?: string,
  expand?: string,
  fuzzy?: string,
) {
  let findApi = `https://api.getAddress.io/find/${postcode}?api-key=${apiKey}`
  if (sort) findApi += '&sort=true'
  if (fuzzy) findApi += '&fuzzy=true'
  if (format) findApi += '&format=true'
  if (expand) findApi += '&expand=true'

  // console.log({ findApi })
  // NOTE: format & expand together is ignored and just the first is taken
  let response = await fetch(findApi)
  if (!response.ok) {
    return null
  }
  let json = (await response.json()) as { result: Postcode }
  return json
}

export { find }
