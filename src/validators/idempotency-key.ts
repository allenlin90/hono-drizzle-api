import { validator } from "hono/validator";
import { BAD_REQUEST } from "@/http-status-codes";

export const idempotencyKey = validator("header", (value, c) => {
  const idempotencyKey = value["idempotency-key"];

  if (idempotencyKey == undefined || idempotencyKey === "") {
    return c.json(
      {
        message: "Idempotency-Key is required",
      },
      BAD_REQUEST
    );
  }

  return { idempotencyKey };
});

export default idempotencyKey;
