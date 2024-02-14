import log from "log";
import nodemailer from "nodemailer";
var AWS = require("aws-sdk");

const HOST_NAME = process.env.HOST_NAME || "disc.gsfc.nasa.gov";
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "mEditor";
const MAIL_FROM_USERNAME = process.env.MAIL_FROM_USERNAME || "info";
const ON_MCP = process.env.ON_MCP || false;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

log.debug("Sending mail from host name: %s", HOST_NAME);
log.debug("Using mail host: %s", process.env.MAIL_HOST);

const transporter = nodemailer.createTransport({
  newline: "unix",
  host: process.env.MAIL_HOST,
  port: 25,
  tls: {
    rejectUnauthorized: false,
  },
});

export function sendMail(subject, text, html, to, cc = "") {
  /* If using AWS MCP environment, need to use AWS SDK to send email */
  if (ON_MCP) {
    return new Promise((resolve, reject) => {
      log.debug("Sending email using AWS SDK...");
      AWS.config.update({ region: AWS_REGION });

      // Parse To addresses
      var to_addresses = [];
      var to_users = to.split(",");
      for (let i = 0; i < to_users.length; i++) {
        var split_to = to_users[i].split(" ");
        var to_address = split_to[split_to.length - 1]
          .replace("<", "")
          .replace(">", "");
        to_addresses.push(to_address);
      }
      // Parse CC addresses
      var cc_addresses = [];
      if (cc) {
        var cc_users = cc.split(",");
        for (let i = 0; i < cc_users.length; i++) {
          var split_cc = cc_users[i].split(" ");
          var cc_address = split_cc[split_cc.length - 1]
            .replace("<", "")
            .replace(">", "");
          cc_addresses.push(cc_address);
        }
      }
      var params = {
        Destination: {
          CcAddresses: cc_addresses,
          ToAddresses: to_addresses,
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: html,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: subject,
          },
        },
        Source: `${MAIL_FROM_USERNAME}@${HOST_NAME}` /* required */,
        ReplyToAddresses: [ `${MAIL_FROM_USERNAME}@${HOST_NAME}` ],
      };

      log.debug("Attempting to send message ", params);
      try {
        // Create the promise and SES service object
        var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" }).sendEmail(
          params,
          (err, response) => {
            if (err) {
              throw err;
            } else {
              resolve(response);
            }
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  } else {
  /* Sending email in on-prem environment */
    return new Promise((resolve, reject) => {
      const from = `${MAIL_FROM_NAME} <${MAIL_FROM_USERNAME}@${HOST_NAME}>`;
      const message = { from, subject, text, html, to, cc };

      log.debug("Attempting to send message ", message);

      try {
        transporter.sendMail(message, (err, response) => {
          if (err) {
            throw err;
          } else {
            resolve(response);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}
