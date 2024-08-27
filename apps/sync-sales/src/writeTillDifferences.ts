import { writeFileSync } from 'fs'
import { type RegisterClosure } from '@wwsc/lib-sumup-pos'
import { Big } from 'big.js'

import {
  db,
  registerClosures,
  registerPayments,
  type InsertRegisterClosure,
  type InsertRegisterPayment,
} from '@wwsc/lib-db'

export const writeTillDifferences = async (
  closures: RegisterClosure[],
  directory: string,
) => {
  let file = `${directory}/closures.json`
  writeFileSync(file, JSON.stringify(closures, null, 2))

  for (const closure of closures) {
    const {
      payments,
      register_name,
      staff_name,
      time_from,
      time_to,
      expected_cash_balance,
      cash_balance,
      notes,
    } = closure

    let insert: InsertRegisterClosure = {
      id: closure.id,
      name: register_name,
      staff: staff_name,
      from: time_from,
      to: time_to,
      notes: notes,
      expected: expected_cash_balance,
      counted: cash_balance,
      variance: Big(cash_balance).minus(expected_cash_balance).toNumber(),
    }

    await db.insert(registerClosures).values(insert)

    for (const payment of payments) {
      let rPayment: InsertRegisterPayment = {
        closure: closure.id,
        method: payment.method,
        expected: Number(payment.expected),
        counted: Number(payment.counted),
      }

      await db.insert(registerPayments).values(rPayment)
    }
  }
  return closures
}
