import { GET } from './GET'
import type { BankAccountList, BankAccount } from './Types'

export { type BankAccountList }
export const getBankAccounts = async (bearer: string) => {
  const accounts = await GET<BankAccountList>('bank_accounts', bearer)()
  return accounts ? accounts.$items : []
}

export const wwcHSBC = (accounts: BankAccount[]) => {
  const name = 'Bank Current Account (HSSBC 41828193) (1200)'
  let account = accounts.find((a) => a.displayed_as === name)
  return account
}
