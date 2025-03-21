import { useMutation, UseMutationResult } from '@tanstack/react-query'

import mediaApiRequest from '@/apiRequests/media'
import { UploadImageResType } from '@/schemaValidations/media.schema'

export const useUploadMediaMutation = (): UseMutationResult<
  QueryResponseType<UploadImageResType>,
  Error,
  FormData,
  unknown
> => {
  return useMutation({
    mutationFn: mediaApiRequest.upload,
  })
}
