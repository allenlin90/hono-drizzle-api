import { PREFIX } from "@/constants";
import { generateRandomString } from "@/utils/generate-random-string";

export const generateBrandedUid = (prefix: PREFIX, length?: number) => {
  return `${prefix}_${generateRandomString(length)}`;
};
