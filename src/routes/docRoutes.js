const express = require("express");
const { getAllDocs } = require("../controllers/docController");

const router = express.Router();
router.get("/", getAllDocs);

module.exports = router;
