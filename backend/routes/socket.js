import { notifyAdmins } from "../socket.js";

router.post("/submit", async (req, res) => {
  // save assignment...

  notifyAdmins("assignment_submitted", {
    student: "Sunny",
    title: "DSA Assignment",
  });

  res.json({ success: true });
});
module.exports=router;