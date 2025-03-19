import * as HttpStatusPhrases from "@/http-status-phrases";
import createMessageObjectSchema from "./create-message-object";

export const UnauthorizedSchema = createMessageObjectSchema(
  HttpStatusPhrases.FORBIDDEN
);

export default UnauthorizedSchema;
