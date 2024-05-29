import { TaxRateList } from './Types'
import { GET } from './GET'

export { type TaxRateList }

export const getTaxRates = async (code: string) => {
  const getTaxRatesData = GET<TaxRateList>('tax_rates', code)
  const taxRates = await getTaxRatesData()
  return taxRates.$items
}
