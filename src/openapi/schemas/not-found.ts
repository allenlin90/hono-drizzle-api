import * as HttpStatusPhrases from "@/http-status-phrases";
import createMessageObjectSchema from "./create-message-object";

export const notFoundSchema = createMessageObjectSchema(
  HttpStatusPhrases.NOT_FOUND
);

export default notFoundSchema;
