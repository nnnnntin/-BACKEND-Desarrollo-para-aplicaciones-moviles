const Mailjet = require("node-mailjet");

const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

const sendEmail = async (toDoTitle) => {
  try {
    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "valentin.acosta512@gmail.com",
            Name: "Valentín Acosta",
          },
          To: [
            {
              Email: "valentin.acosta512@gmail.com",
              Name: "Valentín Acosta",
            },
          ],
          Subject: "Nuevo mail - " + toDoTitle,
          TextPart: "Nuevo mail",
          HTMLPart: "Nuevo mail",
        },
      ],
    });
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = sendEmail;
