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
let displayGetCRUD = async (req, res) => {
  let data = await CRUDService.getAllUser();
  return res.render("display.ejs", {
    dataTable: data
  });
};

let getEditCRUD = async (req, res) => {
  let userId = req.query.id;
  if (userId) {
    let userData = await CRUDService.getUserInfoById(userId);

    return res.render("editCRUD.ejs", {
      user: userData
    });
  } else {
    return res.send("User Not Found");
  }
};

let putCRUD = async (req, res) => {
  let data = req.body;
  let allUsers = await CRUDService.updateUserData(data);
  return res.render("display.ejs", {
    dataTable: allUsers
  });
};

let deleteCRUD = async (req, res) => {
  let id = req.query.id;
  if (id) {
    await CRUDService.deleteUserById(id);
    return res.send("Delete the user");
  } else {
    return res.send("user not found");
  }
};
module.exports = {
  getHomePage: getHomePage,
  getAboutPage: getAboutPage,
  getCRUD: getCRUD,
  postCRUD: postCRUD,
  displayGetCRUD: displayGetCRUD,
  getEditCRUD: getEditCRUD,
  putCRUD: putCRUD,
  deleteCRUD: deleteCRUD
};
