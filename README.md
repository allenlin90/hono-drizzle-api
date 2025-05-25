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
2. 
## Business requirements

### Business logic

1. After onboarding clients, shows can be created and hosted on multiple platforms.
2. A show can be hosted by one or more MCs. 
3. A show can be live-streamed on multiple platforms.
4. A show can be hosted in a studio room or remotely.
5. Materials can be created by team, out-sourced, or provided by clients.
6. Materials can be re-used for the same show on different platforms if they are neutral and platform-agnostic.
7. Materials can be specific for campaign or platforms.
8. MC has reviews on each show
9. A show on a platform needs to be prepared with onset-tasks
   1. pre-production
   2. production
   3. post-production
10. Each show has reviews for each associated mc and platform
   1. `Mc` performance
   2. Sales performance of a show on a platform

### Features

1. `Mc` users can query `Show` they are assigned the view should include
   1. `Show.uid`
   2. `Show.name`
   3. `Show.start_time` and `Show.end_time`
   4. `StudioRoom.name`
2. `Member.type=operator` users can query 
   1. list of `OnsetTasks` they are assigned
   2. list of `ShowMcs` to review
   3. list of `ShowPlatforms` to review

### Logistics and operations

1. A user can be an `admin` resolved by 3rd party auth service based on `better-auth`
   1. joined organization and team
   2. the assigned role in the organization
2. Admin users can create, read, update, and delete
   1. many `Shows` and 
      1. assign to multiple `Platforms` to create `ShowPlatforms`
      2. assign to multiple `MCs` to create `ShowMcs`
   2. assign `Member.type=operator` to review each `ShowMc` and `ShowPlatform`
3. Each `ShowMc` has one or more `ShowMcMaterials` to be used for a show
4. Query list of `OnsetTasks` that can be filtered by 
   1. `Show.start_time` and/or `Show.end_time`
   2. `Member.id`
   3. `Client.id`
   4. `StudioRoom.id`
