import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index";
import addresses from "@/routes/addresses/addresses.index";
import brands from "@/routes/brands/brands.index";
import cities from "@/routes/cities/cities.index";
import showPlatformMcs from "@/routes/show-platform-mcs/show-platform-mcs.index";
import showPlatforms from "@/routes/show-platforms/show-platforms.index";
import shows from "@/routes/shows/shows.index";
import studioRooms from "@/routes/studio-rooms/studio-rooms.index";
import studios from "@/routes/studios/studios.index";
import platforms from "@/routes/platforms/platforms.index";
import materials from "@/routes/materials/materials.index";
import mcs from "@/routes/mcs/mcs.index";
import operators from "@/routes/operators/operators.index";
import users from "@/routes/users/users.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  addresses,
  materials,
  brands,
  cities,
  showPlatformMcs,
  showPlatforms,
  shows,
  studioRooms,
  studios,
  mcs,
  operators,
  platforms,
  users,
];

routes.forEach((route) => app.route("/", route));

export default app;
