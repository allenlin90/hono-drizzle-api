import env from "@/env";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { reset, seed } from "drizzle-seed";

import { PREFIX } from "@/constants";
import {
  generateRandomString,
  generateBrandedUid,
} from "./helpers/random-string.helpers";

if (!env.DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

const tables = {
  address: schema.address,
  brand: schema.brand,
  city: schema.city,
  mcShowReview: schema.mcShowReview,
  mc: schema.mc,
  operator: schema.operator,
  platform: schema.platform,
  brandMaterial: schema.brandMaterial,
  showPlatformMaterial: schema.showPlatformMaterial,
  showPlatformMc: schema.showPlatformMc,
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
  const now = new Date().toISOString();
  const timestamps = {
    createdAt: r.default({ defaultValue: now }),
    updatedAt: r.default({ defaultValue: now }),
    deletedAt: r.default({ defaultValue: null }),
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
        subDistrict: r.valuesFromArray({
          values: SUB_DISTRICTS,
        }),
        district: r.valuesFromArray({ values: DISTRICTS }),
        cityId: r.int({ minValue: 1, maxValue: 3 }),
        province: r.state(),
        postcode: r.postcode(),
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
        userId: r.int({ minValue: 1, maxValue: 5, isUnique: true }),
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
        userId: r.int({ minValue: 6, maxValue: 7, isUnique: true }),
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
    showPlatform: {
      count: 20,
      columns: {
        showId: r.int({ minValue: 1, maxValue: 20, isUnique: true }),
        platformId: r.int({ minValue: 1, maxValue: 3 }),
        isActive: r.default({ defaultValue: true }),
        ...timestamps,
      },
    },
    show: {
      count: 20,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 20 }, () =>
            generateBrandedUid(PREFIX.SHOW)
          ),
        }),
        brandId: r.int({ minValue: 1, maxValue: 5 }),
        name: r.valuesFromArray({ values: SHOW_NAMES }),
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
        studioId: r.int({ minValue: 1, maxValue: 1 }),
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
        addressId: r.int({ minValue: 1, maxValue: 10, isUnique: true }),
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
        clerkUid: r.valuesFromArray({
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
