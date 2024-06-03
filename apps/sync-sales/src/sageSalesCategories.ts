import {
  SummarySalesItem,
  DailySalesCategory,
  SingleCategory,
} from '@wwsc/lib-sumup-pos'

import { SageScopePredicates } from './Types'

export const sageSalesCategories = (items: SummarySalesItem[]) => {
  // The following categories are ones that have complex predicates related to Sage
  const categories: DailySalesCategory[] = []

  Object.entries(SageScopePredicates).forEach(([category, predicate]) => {
    categories.push(...SingleCategory(category, predicate, items))
  })

  return categories
}
