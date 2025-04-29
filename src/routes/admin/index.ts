import addresses from "@/routes/admin/addresses/addresses.index";
import brands from "@/routes/admin/brands/brands.index";
import cities from "@/routes/admin/cities/cities.index";
import showPlatformMaterials from "@/routes/admin/show-platform-materials/show-platform-materials.index";
import showPlatformMcs from "@/routes/admin/show-platform-mcs/show-platform-mcs.index";
import showPlatforms from "@/routes/admin/show-platforms/show-platforms.index";
import shows from "@/routes/admin/shows/shows.index";
import studioRooms from "@/routes/admin/studio-rooms/studio-rooms.index";
import studios from "@/routes/admin/studios/studios.index";
import platforms from "@/routes/admin/platforms/platforms.index";
import materials from "@/routes/admin/materials/materials.index";
import mcs from "@/routes/admin/mcs/mcs.index";
import operators from "@/routes/admin/operators/operators.index";
import users from "@/routes/admin/users/users.index";

export const adminRoutes = [
  addresses,
  materials,
  brands,
  cities,
  showPlatformMaterials,
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

export default adminRoutes;