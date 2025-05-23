```
npm install
npm run dev
```

```
open http://localhost:3000
```

# Features

- Bulk insert `show` with `show_platform` (e.g. 500 records)

# Engineering TODOs
- [ ] Rate limiting
- [ ] Helmet security headers
- [ ] Unit tests
- [ ] Integration tests

---

# Auth

## Authentication

1. Relies on a `better-auth` based authentication service to resolve JWTs with JWKs.

## Authorization

1. Each session has memberships that has roles (`admin` or `member`)

# Models and ER (Entity relationship) 

1. A `Brand`
   1. has many `Shows`
   2. has many `Materials`
2. A `Platform`
   1. can host many `Shows`
3. A `Show` 
   1. belongs to `Brands`
   2. can be hosted on multiple `Platforms`, as have many `ShowPlatforms`
4. A `ShowPlatform`
   1. belongs to a `Show`
   2. belongs to a `Platform`
   3. associates a `Show` and a `Platform`
   4. has a `ShowReview`
   5. may or may not be hosted in a `StudioRoom` (as a remote show if not associated with `StudioRoom`)
   6. can use multiple `Materials`
   7. can be hosted by one or many `MCs`
   8. has many `Tasks` 
5. A `ShowReview`
   1. belongs to a `ShowPlatform`
   2. is assigned and reviewed by a `User`
6. A `Material` 
   1. may or may not belong to a `Brand`
   2. can be assigned to many `ShowPlatforms`
7. A `StudioRoom`
   1. belongs to a `Studio`
   2. can host one or many `ShowPlatforms` at once
8. A `Studio`
   1. may or may not be associated with an `Address` (as a virtual Studio if not associated with an `Address`)
   2. has many `StudioRooms`
9. An `Address`
   1. belongs to a `City`
   2. can be associated with many `Studios`
10. A `City`
   1. has many `Addresses`
11. A `MC`
   1. may or may not be associated with a `User` (as a virtual MC if not associated with a `User`)
   2. can host multiple `ShowPlatforms`
   3. has many `McShowReviews`
12. A `ShowPlatformMC`
    1.  belongs to a `ShowPlatform`
    2.  belongs to a `MC`
    3.  associates a `ShowPlatform` and a `MC`
13. A `McShowReview`
    1. belongs to a `MC` and to a `ShowPlatformMC`
14. A `Operator`
   1. may or may not be associated with a `User` (as a virtual MC if not associated with a `User`)
   2. can manage `Tasks`
15. A `Task`
   1. belongs to a `ShowPlatform`
   2. can be `pre-production`, `production`, and `post-production` for a `ShowPlatform`
   3. can be assigned to a `Operator`

## Business requirements

### Business logic

1. After onboarding brands, shows can be created and hosted on multiple platforms.
2. A show on a platform can be hosted by one or more MCs. 
3. Materials can be created by team, out-sourced, or provided by brands. 
4. Materials can be re-used for the same show on different platforms if they are neutral and platform-agnostic.
5. Some materials can be specific for campaign or platforms.
6. A show can be hosted in a studio room or remotely.
7. MC has reviews on each show (per platform)
8. Shows on each platform are reviewed to collect data such as revenue, CTA, and other marketing or sales metrics. 
9. A show on a platform needs to be prepared with tasks, such as pre-production, production, and post-production.

### Features

1. `MC` users can query `Show` they are assigned the view should include
   1. `Show.uid`
   2. `Platform.name`
   3. `Show.start_time` and `Show.end_time`
   4. `Brand.name`
   5. `Show.name`
   6. `StudioRoom.name`
2. `Operator` users can query `Tasks` they are assigned

### Logistics and operations

1. A user can be an `admin` resolved by 3rd party auth service based on `better-auth`.
2. Admin users can write, update, and delete
   1. many `Shows` and assign to multiple `Platforms` to create `ShowPlatforms`
   2. many `MCs` and `Materials` to many `ShowPlatforms`
   3. many `ShowPlatforms` and assign resources (`StudioRoom`, `MCs`, and `Materials`) in bulk
3. Query list of `Tasks` that can be filtered by 
   1. `Show.start_time` and/or `Show.end_time`
   2. `Operators.id`
   3. `Brand.id`
   4. `Studio`

### Analysis queries

1. Query `Shows` of a `Brand`
2. Query `Shows` hosted on a `Platform`
   1. Analyze `Brand` performance on a `Platform`
   2. Analyze `MC` performance on a `Platform`
