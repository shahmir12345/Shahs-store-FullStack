const productModel = require("../models/product.model");

/**
 * Regex yahan text ke andar matching/search karne ke liye use ho raha hai. iPhone 15
            Samsung Phone
            Laptop
            iphone charger
 * Matching Products
            iPhone 15
            iphone charger
 * i = case-insensitive  (i, I , a , A)
 * Aise products do jinka name iphone se match kare AND category electronics ho. -> const products = await Product.find(filter);
 * If filter({}) empty hai to sab products aa jaayenge.
 */
exports.getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // i means case-insensitive
    }

    if (category) {
      //means category ka poora word define karo Trouser, trouser, tROUSER,TroUSER etc
      filter.category = { $regex: `^${category}$`, $options: "i"};
    }

    const products = await productModel.find(filter).sort({ createdAt: -1 }); //-1 -> latest product first and 1 -> oldest product first
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductsById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    const product = await productModel.create({
      name,
      description,
      price,
      category,
      stock,
      image,
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * URL se product ki ID lo → body mein jo changes aaye hain woh product mein update karo → updated product wapas bhejo.
 * req.params.id = kis product ko update karna hai
 * req.body = usmein kya change karna hai, jo user ne frontend se bheja hai update ke liye
 * new: true = updated product wapas do usually schema old product return karta hai
 * runValidators: true = schema validation bhi check karo jo min : 0, required : true hai price aur stock ke liye wo update ke time bhi check ho
 */

exports.updateProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
