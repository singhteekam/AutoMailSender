const nodeCron = require("node-cron");
const express = require("express");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const axios = require("axios");
dotenv.config({ path: ".env" });

const app = express();
let list = [];

nodeCron.schedule(
  "*/2 * * * *",
  async function jobYouNeedToExecute() {
    let dataOfGSheet = [];
    try {
      res = await axios(
        `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GSHEETLINK}/values/Sheet1?alt=json&key=${process.env.GSHEETAPIKEY}`
      );
      // console.log(res.data.values);
      dataOfGSheet = res.data.values;
      // console.log(dataOfGSheet);
      console.log("Working..." + new Date().toLocaleString());
    } catch (error) {
      console.log("Error occured: " + error);
    }

    list.push("Job at: " + new Date().toLocaleString());

    dataOfGSheet.forEach((row) => {
      // console.log(
      //   row[0] + " " + row[1] + " " + row[2] + " " + row[3] + " " + row[4]+" "+row[5]
      // );
      nodeCron.schedule(
        `${row[0]} ${row[1]} ${row[2]} ${row[3]} ${row[4]} *`,
        function jobYouNeedToExecute2() {
          console.log(
            "Executing Row..." + row + " at: " + new Date().toLocaleString()
          );

          var time = new Date().toLocaleString();
          let transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.EMAIL, // generated ethereal user
              pass: process.env.PASS, // generated ethereal password
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          const receivers = [row[5], process.env.EMAIL]; // multiple receivers
          console.log("Receivers are: " + receivers + " at: " + time);
          receivers.forEach((receiver) => {
            let mailOptions = {
              from: "process.env.EMAIL",
              to: receiver, // list of receivers
              subject: "Testing purpose!!", // Subject line
              text: `Hello ${receiver},\n Testing. \n\nEmal sent at:${time} \n \nThis is system generated mail. \n\nThanks & Regards\nTeekam Singh`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              // console.log("Message sent: %s", info.messageId);
              // console.log(
              //   "Preview URL: %s",
              //   nodemailer.getTestMessageUrl(info)
              // );
              console.log("Mail sent to: %s", receiver);
              //   res.render('index.html');
            });
          }); // End of forEach loop

          list.push(
            "Mail sent at: " +
              new Date().toLocaleString() +
              " to: " +
              row[5] +
              "- " +
              row[6]
          );
        }
      );
      
    });
  }
);


app.get("/", (req, res)=>{
  console.log("Running app.get()... at: " + new Date().toLocaleString());
  res.send("Running app.get()... at: " + new Date().toLocaleString());
});


const port = process.env.PORT || 5000;
app.listen(port);
  
