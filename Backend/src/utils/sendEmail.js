
const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});



const wrap = (html, logoSrc) => `
<div style="background:#f1f5f9;padding:16px 10px;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
    style="max-width:680px;width:100%;margin:0 auto;background:#ffffff;border-radius:14px">
    <tr>
      <td align="center" style="padding:14px 20px 4px">
        <img src="${logoSrc}" alt="Shah's Store"
          width="220" style="display:block;width:220px;max-width:100%;height:auto;margin:0 auto" />
      </td>
    </tr>
    <tr>
      <td style="padding:8px 30px 20px;color:#0f172a;font-size:16px;line-height:1.6">
        ${html}
      </td>
    </tr>
    <tr>
      <td align="center" style="padding:12px 20px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px">
        <strong style="color:#153F35;font-size:14px">Shah's Store</strong>
        <br/>
        Quality products, honest prices, delivered to your door.
        <br/>
        <span style="font-size:11px;color:#94a3b8">
          © ${new Date().getFullYear()} Shah's Store. All rights reserved.
        </span>
      </td>
    </tr>
  </table>
</div>`;


const sendEmail = async ({ to, subject, html }) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    const logoSrc = isProduction
      ? `${process.env.CLIENT_URL}/logo.png`
      : "cid:store-logo";

    await transporter.sendMail({
      from: `"Shah's Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: wrap(html, logoSrc),

      ...(!isProduction && {
        attachments: [
          {
            filename: "logo.png",
            path: path.join(__dirname, "../assets/logo.png"),
            cid: "store-logo",
          },
        ],
      }),
    });

    return true;
  } catch (error) {
    console.error("Email error:", error.message);
    return false;
  }
};

module.exports = sendEmail;















// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const wrap = (html) => `
// <div style="background:#f8fafc;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">
//   <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
//     style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px">
//     <tr><td align="center" style="padding:24px 24px 8px">
//       <img src="${process.env.CLIENT_URL}/logo.png" alt="Shah's Store"
//         width="72" style="display:block;height:auto;max-width:72px" />
//     </td></tr>
//     <tr><td style="padding:8px 24px 28px;color:#0f172a;font-size:15px;line-height:1.6">
//       ${html}
//     </td></tr>
//     <tr><td align="center"
//       style="padding:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:12px">
//       Shah's Store
//     </td></tr>
//   </table>
// </div>`;

// const sendEmail = async ({ to, subject, html }) => {
//   try {
//     await transporter.sendMail({
//       from: `"Shah's Store" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html: wrap(html),
//     });
//     return true;
//   } catch (error) {
//     console.error("Email error:", error.message);
//     return false;
//   }
// };

// module.exports = sendEmail;