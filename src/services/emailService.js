require("dotenv").config();
import { reject } from "lodash";
import nodemailer from "nodemailer";

let sendSimpleEmail = async (dataSend) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_APP, // generated ethereal user
      pass: process.env.EMAIL_APP_PASSWORD // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '" 😝 Lê Văn Kiệm 😘 " <lvkkiem2002@gmail.com>', // sender address
    to: dataSend.reciverEmail, // list of receivers
    subject: "Thông tin đặt lịch khám bệnh", // Subject line
    html: getBodyHTMLEmail(dataSend)
  });
};

let getBodyHTMLEmail = (dataSend) => {
  let result = "";
  if (dataSend.language === "vi") {
    result = `
    <h3> Xin chào ${dataSend.patientName}!</h3>
    <p>Bạn nhận được email này vì đã đặt lịch khám bệnh onl trên hệ thống khám bệnh của chúng tôi</p>
    <p>Thông tin đặt lịch khám bệnh : </p>
    <div><b>Thời gian : ${dataSend.time}</b></div>
    <div><b>Bác sĩ:  ${dataSend.doctorName}</b></div>

    <p>Nếu các thông tin trên là đúng thì vui lòng click vào đường link
    để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh</p>
    <div>
       <a href=${dataSend.redirectLink} target="_blank">
       Click here
       </a>
       <div>🥰 Xin thân thành cảm ơn 🥰</div>
    </div>

    `;
  }
  if (dataSend.language === "en") {
    result = `
    <h3> Dear ${dataSend.patientName}!
    </h3>
    <p>You received this email because you booked an online medical appointment on Hoi dan it</p>
    <p>Information to book a medical appointment: </p>
    <div><b>Time ${dataSend.time} </b></div>
    <div><b>Doctor ${dataSend.doctorName} </b></div>

    <p>If the above information is correct, please click on the link
    to confirm and complete the medical appointment booking procedure</p>
    <div>
       <a href=${dataSend.redirectLink} target="_blank">
       Click here
       </a>
       <div> Sincerely thank you 🤡</div>
    </div>

    `;
  }
  return result;
};
// let getBodyHTMLEmailRemedy = (dataSend) => {
//   let result = "";
//   if (dataSend.language === "vi") {
//     result = `
//     <h3> Xin chào ${dataSend.patientName}!
//     </h3>
//     <p>Bạn nhận được email này vì đã đặt lịch khám bệnh onl trên hệ thống khám bệnh của chúng tôi</p>
//     <p>Thông tin đơn thuốc được gửi trong file đính kèm. </p>

//        <div>🥰 Xin thân thành cảm ơn 🥰</div>
//     </div>

//     `;
//   }
//   if (dataSend.language === "en") {
//     result = `
//     <h3> Dear  ${dataSend.patientName}!
//     </h3>
//     <p>You received this email because you booked an online medical appointment on Hoi dan it</p>

//        <div> Sincerely thank you</div>
//     </div>

//     `;
//   }
//   return result;
// };
// let sendAttachment = async (dataSend) => {
//   return new Promise(async (resolve, reject) => {
//     try {
//       let transporter = nodemailer.createTransport({
//         host: "smtp.gmail.com",
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//           user: process.env.EMAIL_APP, // generated ethereal user
//           pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
//         },
//       });

//       // send mail with defined transport object
//       let info = await transporter.sendMail({
//         from: '" 😝 Lê Văn Kiệm 😘 " <levankiemdev@gmail.com>', // sender address
//         to: dataSend.email, // list of receivers
//         subject: "Kết quả đặt lịch khám bệnh", // Subject line
//         html: getBodyHTMLEmailRemedy(dataSend),
//         attachments: [
//           {
//             // encoded string as an attachment
//             // filename: `remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
//             // content: 'asdf',
//             // encoding: dataSend.imgBase64,
//             filename: `remedy-${
//               dataSend.patientId
//             }-${new Date().getTime()}.png`,
//             content: dataSend.imgBase64.split("base64,")[1],
//             encoding: "base64"
//           }
//         ]
//       });
//       resolve(true)
//     } catch (e) {
//       reject(e);
//     }
//   });
// };

module.exports = {
  sendSimpleEmail: sendSimpleEmail
  // sendAttachment: sendAttachment
};
