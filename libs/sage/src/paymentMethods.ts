import { PaymentMethodList } from './Types'
import { GET } from './GET'

export { type PaymentMethodList }

export const getPaymentMethods = async (code: string) => {
  const getPaymentMethodsData = GET<PaymentMethodList>('payment_methods', code)
  const payment = await getPaymentMethodsData()
  return payment.$items
}
