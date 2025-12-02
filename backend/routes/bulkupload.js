
const express = require("express");
const router = express.Router();
const {sendEmail}=require( "../utils/bulkupload.js");  // import the function
// simple password generator
const upload=require("../middleware/upload.js");
const fs = require("fs");
const csv = require("csv-parser");
function generatePassword() {
    return Math.random().toString(12).slice(-8);
}

router.post("/send-emails", upload.single("file"), async (req, res) => {
    try {
        const emails = [];

        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on("data", (row) => {
                emails.push(row.email);
            })
            .on("end", async () => {
                for (const email of emails) {
                    const newPass = generatePassword();
                    
                    await sendEmail(email, newPass);
                }

                fs.unlinkSync(req.file.path);

                res.json({ success: true, message: "All emails sent!" });
            });

    } catch (err) {
        return res.status(500).json({ error: "Error sending emails" });
    }
});

module.exports = router;