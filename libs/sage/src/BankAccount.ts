import { GET } from './GET'
import type { BankAccountList } from './Types'

export const getBankAccount = async (code: string) => {
  if (!code) return null

  const getBankAccountsData = GET<BankAccountList>('bank_accounts', code)
  let bankAccounts = await getBankAccountsData()
  const name = 'Bank Current Account (HSSBC 41828193) (1200)'
  let list = bankAccounts.$items.filter(
    (account) => account.displayed_as === name,
  )
  return list
}
