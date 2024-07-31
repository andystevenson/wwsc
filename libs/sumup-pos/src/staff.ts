/**
 * staff - get all the staff from the SumUp POS tills
 *
 * @returns
 */

import { authorization } from './auth'
import { fetch } from '@wwsc/lib-util'

export type Staff = {
  id: string
  outlet_id: string
  outlet_name: OutletName
  staff_name: string
  passcode: number
  is_manager: number
  manager: IsShareable
  role: Role
  active: number
  shareable: number
  is_shareable: IsShareable
  status: Status
  staff_permissions: string
  display_order: number
  staff_image: string | null
  is_courier: number
  email: string | null
  mobile: string | null
  display_name: string
  can_modify_staff: boolean
  can_set_shareable: boolean
}

export type IsShareable = 'No' | 'Yes'

export type OutletName = 'WWSC'

export type Role = 'Manager' | 'Operator'

export type Status = 'Active' | 'Inactive'

export async function staff() {
  const url = 'https://api.thegoodtill.com/api/staffs'
  const response = await fetch(url, { headers: { ...authorization() } })

  if (response.ok) {
    const json = await response.json()
    if (!json.status) return []

    return json.data as Staff[]
  }

  throw Error(`sumup staff failed [${response.statusText}]`)
}
