import { GET } from './GET'
import type { BankAccountList } from './Types'

export { type BankAccountList }
export const getBankAccounts = async (bearer: string) => {
  const accounts = await GET<BankAccountList>('bank_accounts', bearer)()
  return accounts ? accounts.$items : []
}
