import addresses from "@/routes/admin/addresses/addresses.index";
import clients from "@/routes/admin/clients/clients.index";
import cities from "@/routes/admin/cities/cities.index";
import showPlatforms from "@/routes/admin/show-platforms/show-platforms.index";
import shows from "@/routes/admin/shows/shows.index";
import studioRooms from "@/routes/admin/studio-rooms/studio-rooms.index";
import studios from "@/routes/admin/studios/studios.index";
import platforms from "@/routes/admin/platforms/platforms.index";
import materials from "@/routes/admin/materials/materials.index";
import mcs from "@/routes/admin/mcs/mcs.index";

export const adminRoutes = [
  addresses,
  materials,
  clients,
  cities,
  showPlatforms,
  shows,
  studioRooms,
  studios,
  mcs,
  platforms,
];

export default adminRoutes;