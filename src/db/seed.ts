import env from "@/env";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { reset, seed } from "drizzle-seed";

import { PREFIX } from "@/constants";
import { generateBrandedUid } from "./helpers/random-string.helpers";

if (!env.DB_SEEDING) {
  throw new Error('You must set DB_SEEDING to "true" when running seeds');
}

const tables = {
  address: schema.address,
  client: schema.client,
  city: schema.city,
  material: schema.material,
  mc: schema.mc,
  member: schema.member,
  platform: schema.platform,
  showPlatform: schema.showPlatform,
  showMcMaterial: schema.showMcMaterial,
  showMc: schema.showMc,
  show: schema.show,
  studioRoom: schema.studioRoom,
  studio: schema.studio,
};

const CLIENTS = ["puma", "nike", "adidas", "reebok", "new balance"];

const DISTRICTS = [
  "Phra Nakhon",
  "Dusit",
  "Nong Chok",
  "Bang Rak",
  "Bang Khen",
  "Bang Kapi",
  "Pathum Wan",
  "Pom Prap Sattru Phai",
  "Phra Khanong",
  "Min Buri",
  "Lat Krabang",
  "Yan Nawa",
  "Samphanthawong",
  "Phaya Thai",
  "Thon Buri",
  "Bangkok Yai",
  "Huai Khwang",
  "Khlong San",
  "Taling Chan",
  "Bangkok Noi",
  "Bang Khun Thian"
];

const SUB_DISTRICTS = [
  "Wang Burapha Phirom",
  "Wat Ratchabophit",
  "Samran Rat",
  "Ban Bat",
  "Ban Chang Lo",
  "Bang Khun Non",
  "Bang Khun Si",
  "Bang O",
  "Bang Phlat",
  "Bang Yi Khan",
  "Bang Bamru",
  "Bang Chak",
  "Bang Mot",
  "Bang Wa",
  "Bang Duan",
  "Bang Kho",
  "Bang Bon",
  "Bang Khae",
  "Bang Kapi",
  "Bang Chan"
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

  // Helper arrays for foreign key assignments
  const showIds = Array.from({ length: 1000 }, (_, i) => i + 1);
  const platformIds = Array.from({ length: 3 }, (_, i) => i + 1);
  const mcIds = Array.from({ length: 5 }, (_, i) => i + 1);

  return {
    address: {
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 10 }, () => generateBrandedUid(PREFIX.ADDRESS)),
        }),
        address: r.streetAddress(),
        sub_district: r.valuesFromArray({ values: SUB_DISTRICTS }),
        district: r.valuesFromArray({ values: DISTRICTS }),
        city_id: r.int({ minValue: 1, maxValue: 3 }),
        province: r.state(),
        postcode: r.postcode(),
        ...timestamps,
      },
    },
    client: {
      count: 5,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 5 }, () => generateBrandedUid(PREFIX.CLIENT)),
        }),
        name: r.valuesFromArray({ values: CLIENTS, isUnique: true }),
        ...timestamps,
      },
    },
    city: {
      count: 3,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 3 }, () => generateBrandedUid(PREFIX.CITY)),
        }),
        name: r.city(),
        ...timestamps,
      },
    },
    material: {
      count: 30,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 30 }, () => generateBrandedUid(PREFIX.MATERIAL)),
        }),
        client_id: r.int({ minValue: 1, maxValue: 5 }),
        type: r.valuesFromArray({ values: schema.materialTypePgEnum.enumValues }),
        name: r.companyName(),
        description: r.loremIpsum(),
        is_active: r.boolean(),
        resource_url: r.string(),
        ...timestamps,
      },
    },
    mc: {
      count: 5,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 5 }, () => generateBrandedUid(PREFIX.MC)),
          isUnique: true,
        }),
        banned: r.default({ defaultValue: false }),
        email: r.email(),
        ext_id: r.valuesFromArray({
          values: Array.from({ length: 5 }, (_, i) => `ext${i + 1}`),
          isUnique: true,
        }),
        metadata: r.default({ defaultValue: {} }),
        name: r.firstName(),
        ranking: r.valuesFromArray({ values: schema.rankingTypeEnum.enumValues }),
        ...timestamps,
      },
    },
    member: {
      count: 5,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 5 }, () => generateBrandedUid(PREFIX.MEMBER)),
          isUnique: true,
        }),
        banned: r.boolean(),
        email: r.email(),
        ext_id: r.valuesFromArray({
          values: Array.from({ length: 5 }, (_, i) => `member-ext${i + 1}`),
          isUnique: true,
        }),
        metadata: r.default({ defaultValue: {} }),
        name: r.firstName(),
        type: r.valuesFromArray({ values: schema.memberTypeEnum.enumValues }),
        ...timestamps,
      },
    },
    platform: {
      count: 3,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 3 }, () => generateBrandedUid(PREFIX.PLATFORM)),
        }),
        name: r.valuesFromArray({ values: PLATFORMS, isUnique: true }),
        ...timestamps,
      },
    },
    show: {
      count: 1000,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 1000 }, () => generateBrandedUid(PREFIX.SHOW)),
        }),
        client_id: r.int({ minValue: 1, maxValue: 5 }),
        name: r.valuesFromArray({ values: SHOW_NAMES }),
        start_time: r.default({ defaultValue: nowStr }),
        end_time: r.default({ defaultValue: nowLater.toISOString() }),
        studio_room_id: r.int({ minValue: 1, maxValue: 10 }),
        ...timestamps,
      },
    },
    showMc: {
      count: 1000,
      columns: {
        show_id: r.int({ minValue: 1, maxValue: 1000, isUnique: true }),
        mc_id: r.int({ minValue: 1, maxValue: 5 }),
        is_active: r.boolean(),
        note: r.default({ defaultValue: null }),
        review_form_id: r.default({ defaultValue: null }),
        reviewer_id: r.default({ defaultValue: null }),
        ...timestamps,
      },
    },
    showMcMaterial: {
      count: 1000,
      columns: {
        show_mc_id: r.int({ minValue: 1, maxValue: 1000, isUnique: true }),
        material_id: r.int({ minValue: 1, maxValue: 30 }),
        is_active: r.boolean(),
        note: r.default({ defaultValue: null }),
        ...timestamps,
      },
    },
    showPlatform: {
      count: 1000,
      columns: {
        show_id: r.int({ minValue: 1, maxValue: 1000, isUnique: true }),
        platform_id: r.int({ minValue: 1, maxValue: 3 }),
        is_active: r.boolean(),
        ext_id: r.default({ defaultValue: null }),
        note: r.default({ defaultValue: null }),
        review_form_id: r.default({ defaultValue: null }),
        reviewer_id: r.default({ defaultValue: null }),
        ...timestamps,
      },
    },
    studioRoom: {
      count: 10,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 10 }, () => generateBrandedUid(PREFIX.STUDIO_ROOM)),
        }),
        name: r.companyName(),
        studio_id: r.int({ minValue: 1, maxValue: 1 }),
        type: r.valuesFromArray({ values: schema.roomTypeEnum.enumValues }),
        ...timestamps,
      },
    },
    studio: {
      count: 1,
      columns: {
        uid: r.valuesFromArray({
          values: Array.from({ length: 1 }, () => generateBrandedUid(PREFIX.STUDIO)),
        }),
        name: r.companyName(),
        address_id: r.int({ minValue: 1, maxValue: 10, isUnique: true }),
        ...timestamps,
      },
    },
  };
});

console.log("seeding completes");
// @ts-ignore
db.$client.end();
