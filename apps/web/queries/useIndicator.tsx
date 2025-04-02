import { UseQueryResult, useQuery } from '@tanstack/react-query'

import indicatorApiRequest from '@/apiRequests/indicator'
import {
  DashboardIndicatorQueryParamsType,
  DashboardIndicatorResType,
} from '@/schemaValidations/indicator.schema'

export const useDashboardIndicator = (
  enabled: boolean,
  queryParams: DashboardIndicatorQueryParamsType,
): UseQueryResult<QueryResponseType<DashboardIndicatorResType>, Error> => {
  return useQuery({
    queryFn: () => indicatorApiRequest.getDashboardIndicators(queryParams),
    queryKey: ['dashboardIndicators', queryParams],
    enabled,
  })
}
