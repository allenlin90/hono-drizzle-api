import env from "@/env";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { reset, seed } from "drizzle-seed";

import { PREFIX } from "@/constants";
import { generateRandomString } from "@/utils/generate-random-string";
import { generateBrandedUid } from "./helpers/random-string.helpers";

if (!env.DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

const tables = {
  address: schema.address,
  brand: schema.brand,
  city: schema.city,
  // mcShowReview: schema.mcShowReview,
  mc: schema.mc,
  operator: schema.operator,
  platform: schema.platform,
  brandMaterial: schema.brandMaterial,
  showPlatformMaterial: schema.showPlatformMaterial,
  // showPlatformMc: schema.showPlatformMc,
  showPlatformReview: schema.showPlatformReview,
  showPlatform: schema.showPlatform,
  show: schema.show,
  studioRoom: schema.studioRoom,
  studio: schema.studio,
  task: schema.task,
  user: schema.user,
};

const BRANDS = ["puma", "nike", "adidas", "reebok", "new balance"];

const DISTRICTS = [
  "Jakarta Barat",
  "Jakarta Pusat",
  "Jakarta Selatan",
  "Jakarta Timur",
  "Jakarta Utara",
];

const SUB_DISTRICTS = [
  "Kebon Jeruk",
  "Kedoya",
  "Meruya",
  "Sukabumi",
  "Cengkareng",
  "Kalideres",
  "Taman Sari",
  "Tambora",
  "Cengkareng",
  "Grogol",
];

const SHOW_NAMES = [
  "mid-month",
  "payday",
  "double-eleven",
  "black-friday",
  "christmas",
  "new-year",
];

const PLATFORMS = ["shopee", "lazada", "tiktok"];

await reset(db, tables);
await seed(db, tables).refine((r) => {
  const now = new Date();
  const nowLater = new Date(now.getTime() + 1000 * 60 * 60 * 2); // 2 hours later
  const nowStr = now.toISOString();
  const timestamps = {
    created_at: r.default({ defaultValue: nowStr }),
    updated_at: r.default({ defaultValue: nowStr }),
    deleted_at: r.default({ defaultValue: null }),
  };

  return {
    address: {
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 10 }, () =>
            generateBrandedUid(PREFIX.ADDRESS)
          ),
        }),
        address: r.streetAddress(),
        sub_district: r.valuesFromArray({
          values: SUB_DISTRICTS,
        }),
        district: r.valuesFromArray({ values: DISTRICTS }),
        city_id: r.int({ minValue: 1, maxValue: 3 }),
        province: r.state(),
        postcode: r.postcode(),
        ...timestamps,
      },
    },
    brandMaterial: {
      count: 30,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 30 }, () =>
            generateBrandedUid(PREFIX.MATERIAL)
          ),
        }),
        brand_id: r.int({ minValue: 1, maxValue: 5 }),
        type: r.valuesFromArray({
          values: ["mechanic", "scene", "script", "other"],
        }),
        description: r.loremIpsum(),
        ...timestamps,
      },
    },
    brand: {
      count: 5,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 10 }, () =>
            generateBrandedUid(PREFIX.BRAND)
          ),
        }),
        name: r.valuesFromArray({ values: BRANDS, isUnique: true }),
        ...timestamps,
      },
    },
    city: {
      count: 3,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 3 }, () =>
            generateBrandedUid(PREFIX.CITY)
          ),
        }),
        ...timestamps,
      },
    },
    mc: {
      count: 5,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 5 }, () =>
            generateBrandedUid(PREFIX.MC)
          ),
        }),
        name: r.firstName(),
        user_id: r.int({ minValue: 1, maxValue: 5, isUnique: true }),
        ...timestamps,
      },
    },
    operator: {
      count: 2,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 2 }, () =>
            generateBrandedUid(PREFIX.OPERATOR)
          ),
        }),
        name: r.firstName(),
        user_id: r.int({ minValue: 6, maxValue: 7, isUnique: true }),
        ...timestamps,
      },
    },
    platform: {
      count: 3,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 3 }, () =>
            generateBrandedUid(PREFIX.PLATFORM)
          ),
        }),
        name: r.valuesFromArray({ values: PLATFORMS }),
        ...timestamps,
      },
    },
    showPlatformMaterial: {
      count: 10,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 10 }, () =>
            generateBrandedUid(PREFIX.SHOW_PLATFORM_MATERIAL)
          ),
        }),
        ...timestamps,
      },
    },
    showPlatform: {
      count: 1000,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 1000 }, () =>
            generateBrandedUid(PREFIX.SHOW_PLATFORM)
          ),
        }),
        show_id: r.int({ minValue: 1, maxValue: 1000, isUnique: true }),
        platform_id: r.int({ minValue: 1, maxValue: 3 }),
        is_active: r.default({ defaultValue: true }),
        ...timestamps,
      },
    },
    show: {
      count: 1000,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 1000 }, () =>
            generateBrandedUid(PREFIX.SHOW)
          ),
        }),
        brand_id: r.int({ minValue: 1, maxValue: 5 }),
        name: r.valuesFromArray({ values: SHOW_NAMES }),
        start_time: r.default({ defaultValue: nowStr }),
        end_time: r.default({ defaultValue: nowLater.toISOString() }),
        ...timestamps,
      },
    },
    studioRoom: {
      count: 10,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 10 }, () =>
            generateBrandedUid(PREFIX.STUDIO_ROOM)
          ),
        }),
        name: r.companyName(),
        studio_id: r.int({ minValue: 1, maxValue: 1 }),
        type: r.valuesFromArray({ values: ["s", "m", "l"] }),
        ...timestamps,
      },
    },
    studio: {
      count: 1,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 1 }, () =>
            generateBrandedUid(PREFIX.STUDIO)
          ),
        }),
        name: r.companyName(),
        address_id: r.int({ minValue: 1, maxValue: 10, isUnique: true }),
        ...timestamps,
      },
    },
    user: {
      count: 10, // 5 for mcs, 2 for operators
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 10 }, () =>
            generateBrandedUid(PREFIX.USER)
          ),
          isUnique: true,
        }),
        clerk_uid: r.valuesFromArray({
          values: Array.from({ length: 10 }, () => generateRandomString(16)),
          isUnique: true,
        }),
        name: r.firstName(),
        email: r.email(),
        password: r.valuesFromArray({
          values: Array.from({ length: 10 }, () => generateRandomString(32)),
          isUnique: true,
        }),
        ...timestamps,
      },
    },
  };
});

console.log("seeding completes");
// @ts-ignore
db.$client.end();
