const Document = require("../models/Document");

async function getAllDocs(req, res, next) {
  try {
    const docs = await Document.find().sort({ createdAt: -1 });
    res.json({ count: docs.length, data: docs });
  } catch (error) {
    next(error);
  }
}

module.exports = { getAllDocs };
