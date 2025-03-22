import { createApp } from "@/lib/create-app";
import configureOpenAPI from "@/lib/configure-open-api";
import index from "@/routes/index";
import addresses from "@/routes/addresses/addresses.index";
import brands from "@/routes/brands/brands.index";
import cities from "@/routes/cities/cities.index";
import shows from "@/routes/shows/shows.index";
import studioRooms from "@/routes/studio-rooms/studio-rooms.index";
import studios from "@/routes/studios/studios.index";
import platforms from "@/routes/platforms/platforms.index";
import materials from "@/routes/materials/materials.index";
import users from "@/routes/users/users.index";

const app = createApp();

configureOpenAPI(app);

const routes = [
  index,
  addresses,
  materials,
  brands,
  cities,
  shows,
  studioRooms,
  studios,
  platforms,
  users,
];

routes.forEach((route) => app.route("/", route));

export default app;
