import db from "../models/index";
// import bcrypt from "bcryptjs";
require("dotenv").config();
import _ from "lodash";
import emailService from "../services/emailService";

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;
let getTopDoctorHome = (limitInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        limit: limitInput,
        where: { roleId: "R2" },
        order: [["createdAt", "DESC"]],
        attributes: {
          exclude: ["password"]
        },
        include: [
          {
            model: db.Allcode,
            as: "positionData",
            attributes: ["valueEn", "valueVi"]
          },
          {
            model: db.Allcode,
            as: "genderData",
            attributes: ["valueEn", "valueVi"]
          }
        ],
        raw: true,
        nest: true
      });
      resolve({
        errCode: 0,
        data: users
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getALlDoctors = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let doctors = await db.User.findAll({
        where: { roleId: "R2" },
        attributes: {
          exclude: ["password", "image"]
        }
      });

      resolve({
        errCode: 0,
        data: doctors
      });
    } catch (e) {
      reject(e);
    }
  });
};
let checkRequiredFields = (inputData) => {
  let arrFields = [
    "doctorId",
    "contentHTML",
    "contentMarkdown",
    "action",
    "selectPrice",
    "selectPayment",
    "selectProvince",
    "nameClinic",
    "addressClinic",
    "note",
    "specialtyId"
  ];
  let isValid = true;
  let element = "";
  for (let i = 0; i < arrFields.length; i++) {
    if (!inputData[arrFields[i]]) {
      isValid = false;
      element = arrFields[i];
      break;
    }
  }

  return {
    isValid: isValid,
    element: element
  };
};
let saveDetailInfoDoctor = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      let checkObj = checkRequiredFields(inputData);

      if (checkObj.isValid === false) {
        resolve({
          errCode: 1,
          errMessage: `Missing parameter: ${checkObj.element}`
        });
      } else {
        if (inputData.action === "CREATE") {
          await db.Markdown.create({
            contentHTML: inputData.contentHTML,
            contentMarkdown: inputData.contentMarkdown,
            description: inputData.description,
            doctorId: inputData.doctorId
          });
        } else if (inputData.action === "EDIT") {
          let doctorMarkdown = await db.Markdown.findOne({
            where: { doctorId: inputData.doctorId },
            raw: false
          });

          if (doctorMarkdown) {
            doctorMarkdown.contentHTML = inputData.contentHTML;
            doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
            doctorMarkdown.description = inputData.description;
            await doctorMarkdown.save();
          }
        }
        //up
        let doctorInfor = await db.Doctor_Infor.findOne({
          where: {
            doctorId: inputData.doctorId
          },
          raw: false
        });

        // !inputData.note
        if (doctorInfor) {
          //update
          doctorInfor.doctorId = inputData.doctorId;
          doctorInfor.priceId = inputData.selectPrice;
          doctorInfor.provinceId = inputData.selectProvince;
          doctorInfor.paymentId = inputData.selectPayment;
          doctorInfor.nameClinic = inputData.nameClinic;
          doctorInfor.addressClinic = inputData.addressClinic;
          doctorInfor.note = inputData.note;
          doctorInfor.specialtyId = inputData.specialtyId;
          doctorInfor.clinicId = inputData.clinicId;

          await doctorInfor.save();
        } else {
          //create
          await db.Doctor_Infor.create({
            doctorId: inputData.doctorId,
            priceId: inputData.selectPrice,
            provinceId: inputData.selectProvince,
            paymentId: inputData.selectPayment,
            nameClinic: inputData.nameClinic,
            addressClinic: inputData.addressClinic,
            note: inputData.note,
            specialtyId: inputData.specialtyId,
            clinicId: inputData.clinicId
          });
        }
      }
      resolve({
        errCode: 0,
        errMessage: "Save info doctor success"
      });
    } catch (e) {
      reject(e);
    }
  });
};

let getDetailDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing parameter 😟"
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId
          },
          attributes: {
            exclude: ["password"]
          },
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"]
            },
            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"]
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"]
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"]
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"]
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"]
                }
              ]
            },
            {
              model: db.Doctor_Infor
            }
          ],
          raw: false,
          nest: true
        });
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }
        if (!data) data = {};
        resolve({ errCode: 0, data: data });
      }
    } catch (e) {
      reject(e);
    }
  });
};
const bulkCreateSchedule = async (data) => {
  try {
    if (!data.arrSchedule || !data.doctorId || !data.formatedDate) {
      return { errCode: 1, errMessage: "Thiếu tham số bắt buộc!" };
    }

    let schedule = data.arrSchedule;

    if (schedule.length > 0) {
      schedule = schedule.map((item) => {
        return { ...item, maxNumber: MAX_NUMBER_SCHEDULE };
      });
    }

    let existing = await db.Schedule.findAll({
      where: { doctorId: data.doctorId, date: data.formatedDate },
      attributes: ["timeType", "date", "doctorId", "maxNumber"],
      raw: true
    });

    // const toCreate = schedule.filter(a => {
    //   return !existing.some(
    //     b => a.timeType === b.timeType && a.date === new Date(b.date).getTime()
    //   );
    // });
    let toCreate = _.differenceWith(schedule, existing, (a, b) => {
      return a.timeType === b.timeType && +a.date === +b.date;
    });
    if (toCreate && toCreate.length > 0) {
      await db.Schedule.bulkCreate(toCreate);
    }

    console.log(toCreate);

    return {
      errCode: 0,
      errMessage: "OK"
    };
  } catch (e) {
    throw e;
  }
};
let getScheduleByDate = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!"
        });
      } else {
        let dataSchedule = await db.Schedule.findAll({
          where: {
            doctorId: doctorId,
            date: date
          },
          include: [
            {
              model: db.Allcode,
              as: "timeTypeData",
              attributes: ["valueEn", "valueVi"]
            },
            {
              model: db.User,
              as: "doctorData",
              attributes: ["firstName", "lastName"]
            }
          ],

          raw: false,
          nest: true
        });

        if (!dataSchedule) dataSchedule = [];
        resolve({
          errCode: 0,
          data: dataSchedule
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let getExtraInforDoctorById = (idInput) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!idInput) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!"
        });
      } else {
        let data = await db.Doctor_Infor.findOne({
          where: {
            doctorId: idInput
          },
          attributes: {
            exclude: ["id", "doctorId"]
          },
          include: [
            {
              model: db.Allcode,
              as: "priceTypeData",
              attributes: ["valueEn", "valueVi"]
            },
            {
              model: db.Allcode,
              as: "provinceTypeData",
              attributes: ["valueEn", "valueVi"]
            },
            {
              model: db.Allcode,
              as: "paymentTypeData",
              attributes: ["valueEn", "valueVi"]
            }
          ],
          raw: false,
          nest: true
        });

        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getProfileDoctorById = (inputId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!inputId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!"
        });
      } else {
        let data = await db.User.findOne({
          where: {
            id: inputId
          },
          attributes: {
            exclude: ["password"]
          },

          // raw: true
          include: [
            {
              model: db.Markdown,
              attributes: ["description", "contentHTML", "contentMarkdown"]
            },

            {
              model: db.Allcode,
              as: "positionData",
              attributes: ["valueEn", "valueVi"]
            },
            {
              model: db.Doctor_Infor,
              attributes: {
                exclude: ["id", "doctorId"]
              },
              include: [
                {
                  model: db.Allcode,
                  as: "priceTypeData",
                  attributes: ["valueEn", "valueVi"]
                },
                {
                  model: db.Allcode,
                  as: "provinceTypeData",
                  attributes: ["valueEn", "valueVi"]
                },
                {
                  model: db.Allcode,
                  as: "paymentTypeData",
                  attributes: ["valueEn", "valueVi"]
                }
              ]
            }
          ],

          raw: false,
          nest: true
        });
        if (data && data.image) {
          data.image = new Buffer(data.image, "base64").toString("binary");
        }
        if (!data) data = {};
        resolve({
          errCode: 0,
          data: data
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let getListPatientForDoctor = (doctorId, date) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!doctorId || !date) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!"
        });
      } else {
        let data = await db.Booking.findAll({
          where: {
            statusId: "S2",
            doctorId: doctorId,
            date: date
          },
          include: [
            {
              model: db.User,
              as: "patientData",
              attributes: ["email", "firstName", "address", "gender"],
              include: [
                {
                  model: db.Allcode,
                  as: "genderData",
                  attributes: ["valueEn", "valueVi"]
                }
              ]
            },
            {
              model: db.Allcode,
              as: "timeTypeDataPatient",
              attributes: ["valueEn", "valueVi"]
            }
          ],
          raw: false,
          nest: true
        });

        resolve({
          errCode: 0,
          data: data
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};
let sendRemedy = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (
        !data.email ||
        !data.doctorId ||
        !data.patientId ||
        !data.timeType ||
        !data.imgBase64
      ) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter!"
        });
      } else {
        //update patient status
        let appointment = await db.Booking.findOne({
          where: {
            doctorId: data.doctorId,
            patientId: data.patientId,
            timeType: data.timeType,
            statusId: "S2"
          },
          raw: false
        });

        if (appointment) {
          appointment.statusId = "S3";
          await appointment.save();
        }

        //send emil remedy
        await emailService.sendAttachment(data);
        resolve({
          errCode: 0,
          errMessage: "ok"
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getTopDoctorHome: getTopDoctorHome,
  getALlDoctors: getALlDoctors,
  saveDetailInfoDoctor: saveDetailInfoDoctor,
  getDetailDoctorById: getDetailDoctorById,
  bulkCreateSchedule: bulkCreateSchedule,
  getScheduleByDate: getScheduleByDate,
  getExtraInforDoctorById: getExtraInforDoctorById,
  getProfileDoctorById: getProfileDoctorById,
  getListPatientForDoctor: getListPatientForDoctor,
  sendRemedy: sendRemedy
};
