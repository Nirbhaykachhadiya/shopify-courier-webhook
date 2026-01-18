import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("OK");
  }

  try {
    const order = req.body;
    const sheets = google.sheets({ version: "v4", auth });

    const shipping = order.shipping_address || {};
    const customer = order.customer || {};
    const isCOD = order.financial_status !== "paid";

    const row = [
      order.order_number,                                   // SERIAL NUMBER
      "",                                   // BARCODE NO
      "0.5",                                // PHYSICAL WEIGHT
      shipping.city || "",                  // RECEIVER CITY
      shipping.zip || "",                   // RECEIVER PINCODE
      shipping.name || "",                  // RECEIVER NAME
      shipping.address1 || "",              // RECEIVER ADD LINE 1
      shipping.address2 || "",              // RECEIVER ADD LINE 2
      "",                                   // RECEIVER ADD LINE 3
      "FALSE",                                  // ACK
      process.env.SENDER_MOBILE,            // SENDER MOBILE NO
      shipping.phone || order.phone || "",  // RECEIVER MOBILE NO
      isCOD ? "" : "PPD",                   // PREPAYMENT CODE
      isCOD ? "" : order.total_price,       // VALUE OF PREPAYMENT
      isCOD ? "COD" : "",                   // CODR/COD
      isCOD ? order.total_price : "",       // VALUE FOR CODR/COD
      "", "", "NROLL",                        // INSURANCE / SHAPE
      "10", "10", "5",                      // L B H
      "", "", "", "",                       // PRIORITY / DELIVERY
      process.env.SENDER_NAME,
      process.env.SENDER_COMPANY,
      process.env.SENDER_CITY,
      process.env.SENDER_STATE,
      process.env.SENDER_PINCODE,
      process.env.SENDER_EMAIL,
      "", "", "",                           // SENDER ALT/KYC/TAX
      shipping.company || "",
      shipping.province || "",
      customer.email || "",
      "", "", "", "FALSE",                       // RECEIVER EXTRA
      "",
      process.env.SENDER_ADD1,
      process.env.SENDER_ADD2,
      process.env.SENDER_ADD3
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SHEET_ID,
      range: "Orders!A1",
      valueInputOption: "RAW",
      requestBody: { values: [row] }
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "failed" });
  }
}
