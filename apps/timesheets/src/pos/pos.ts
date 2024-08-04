import { login, logout, staff, type Staff } from '@wwsc/lib-sumup-pos'

async function getStaff() {
  try {
    await login()
    let all = await staff()
    await logout()
    return all
  } catch (error) {
    console.error('getStaff', error)
    return []
  }
}

let allStaff: Staff[] = []

async function findStaff(passcode: number | string) {
  if (!allStaff.length) {
    allStaff = await getStaff()
  }

  if (typeof passcode === 'string') {
    return allStaff.find((staff) => staff.id === passcode)
  }

  return allStaff.find((staff) => staff.passcode === passcode)
}

setTimeout(async () => {
  // refresh the staff list every 60 seconds
  let all = await getStaff()
  allStaff = all
}, 1000 * 60)

export { findStaff }
