declare module "ultimate-express" {
  import * as express from "express";

  // Export function that creates an Express-compatible app
  function ultimateExpress(): express.Express;

  export = ultimateExpress;
}
