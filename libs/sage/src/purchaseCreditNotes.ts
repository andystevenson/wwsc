import { Params } from './Types'
import { GET } from './GET'
export const getPurchaseCreditNotes = async (code: string, params: Params) => {
  const getPurchaseCreditNotesData = GET<any>(
    'purchase_credit_notes',
    code,
    params,
  )
  const creditNotes = await getPurchaseCreditNotesData()
  return creditNotes.$items
}
