import http from "@/lib/http";
import { UploadImageResType } from "@/schemaValidations/media.schema";

const prefix = "upload";

const mediaApiRequest = {
  upload: (formData: FormData) =>
    http.post<UploadImageResType>(prefix, formData, {
      baseUrl: "/api",
    }),
};

export default mediaApiRequest;
