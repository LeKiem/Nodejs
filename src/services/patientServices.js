import db from "../models/index";
require("dotenv").config();

let postBookAppointment = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.timeType
        // ||
        // !data.date ||
        // !data.fullName ||
        // !data.selectedGender ||
        // !data.address
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing  parameters"
        });
      } else {
        //upsert patient
        let user = await db.User.findOrCreate({
          where: { email: data.email },
          defaults: {
            email: data.email,
            roleId: "R3",
            gender: data.selectedGender,
            address: data.address,
            firstName: data.fullName
          }
        });

        if (user && user[0]) {
          await db.Booking.findOrCreate({
            where: { patientId: user[0].id },
            defaults: {
              statusId: "S1",
              doctorId: data.doctorId,
              patientId: user[0].id,
              date: data.date,
              timeType: data.timeType
              // token: token
            }
          });
        }
        //create a booking record
        resolve({
          errCode: 0,
          errMessage: "Save information patient succeed 🚀!!"
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  postBookAppointment: postBookAppointment
};