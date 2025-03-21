import queryString from 'query-string'

import http from '@/lib/http'
import {
  DashboardIndicatorQueryParamsType,
  DashboardIndicatorResType,
} from '@/schemaValidations/indicator.schema'

const prefix = 'indicators'

const indicatorApiRequest = {
  getDashboardIndicators: (queryParams: DashboardIndicatorQueryParamsType) =>
    http.get<DashboardIndicatorResType>(
      `/${prefix}/dashboard?` +
        queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        }),
    ),
}

export default indicatorApiRequest
