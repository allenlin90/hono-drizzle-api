import { z } from "@hono/zod-openapi";
import { validator } from "hono/validator";
import { BAD_REQUEST } from "@/http-status-codes";

const validateKey = (key: string) => z.string().uuid().safeParse(key);

// TODO: store and validate idempotency key
export const idempotencyKey = validator("header", (value, c) => {
  const idempotencyKey = value["idempotency-key"];
  const { success } = validateKey(idempotencyKey);

  if (idempotencyKey == undefined || idempotencyKey === "" || !success) {
    return c.json(
      {
        message: idempotencyKey
          ? "Invalid Idempotency-Key"
          : "Idempotency-Key is required",
      },
      BAD_REQUEST
    );
  }

  return { idempotencyKey };
});

export default idempotencyKey;
