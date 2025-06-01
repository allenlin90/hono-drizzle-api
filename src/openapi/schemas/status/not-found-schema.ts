import * as HttpStatusPhrases from "@/http-status-phrases";
import createMessageObjectSchema from "../utils/create-message-object-schema";

export const NotFoundSchema = createMessageObjectSchema(
  HttpStatusPhrases.NOT_FOUND
);

export default NotFoundSchema;
