import { Reference } from './Types'
import { GET } from './GET'

export type User = Reference & {
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  initials: string
  email: string
  locale: string
}

export const getUser = async (bearer: string) => {
  const user = await GET<User>('user', bearer)()
  return user
}
