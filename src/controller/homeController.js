import db from "../models/index";
import CRUDService from "../services/CRUDService";

let getHomePage = async (req, res) => {
  let data = await db.User.findAll();
  console.log(data);
  try {
    return res.render("homepage.ejs", {
      data: JSON.stringify(data)
    });
  } catch (e) {
    console.log(e);
  }
};

let getAboutPage = (req, res) => {
  return res.render("test/about.ejs");
};
let getCRUD = (req, res) => {
  return res.render("crud.ejs");
};
let postCRUD = async (req, res) => {
  let mess = await CRUDService.createNewUser(req.body);
  console.log(mess);
  return res.send("post crud from server");
};

module.exports = {
  getHomePage: getHomePage,
  getAboutPage: getAboutPage,
  getCRUD: getCRUD,
  postCRUD: postCRUD
};
