import type { AppOpenAPI } from "./types";
import packageJson from "../../package.json";
import { apiReference } from "@scalar/hono-api-reference";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/doc", {
    openapi: "3.0.0",
    info: {
      title: "livestream-studio",
      version: packageJson.version,
    },
  });

  app.get(
    "/reference",
    apiReference({
      theme: "kepler",
      layout: "modern",
      url: "/doc",
    })
  );
}
