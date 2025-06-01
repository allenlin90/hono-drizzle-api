import * as HttpStatusPhrases from "@/http-status-phrases";
import createMessageObjectSchema from "../utils/create-message-object-schema";

export const UnauthorizedSchema = createMessageObjectSchema(
  HttpStatusPhrases.UNAUTHORIZED
);

export default UnauthorizedSchema;
