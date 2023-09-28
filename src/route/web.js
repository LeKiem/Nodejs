import express from "express";
import res from "express/lib/response";
import homeController from "../controller/homeController";
let router = express.Router();

let initWebRoutes = app => {
  router.get("/", homeController.getHomePage);
  router.get("/about", homeController.getAboutPage);

  return app.use("/", router);
};
module.exports = initWebRoutes;
