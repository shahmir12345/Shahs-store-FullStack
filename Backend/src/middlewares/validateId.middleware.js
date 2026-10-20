/**
 *  1. Request /products/123 par aati hai.
 *  2. validateId("id") ID check karta hai.
 *  3. ID invalid ho to 400 response milta hai.
 *  4. ID valid ho to getProductById controller chalta hai.
 *  5. Controller database mein product dhoondhta hai; product na mile to 404 de sakta hai.
Yeh bhi yaad rakho: valid format ka matlab yeh nahi ke product database mein mojood bhi hai. Middleware format check karta hai, database mein existence nahi.
 * 400 = id ki shakal hi galat (client-side error)
 */

const mongoose = require("mongoose");

const validateId = (paramName) => (req, res, next) => {
  const id = req.params[paramName];

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID" });
  }

  next();
};

module.exports = validateId;