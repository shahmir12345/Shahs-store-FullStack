const { generateText } = require("../utils/ai");

const SYSTEM_RULES = `You write product descriptions for an online store.
Write one paragraph of 50 to 70 words in a friendly, professional tone.
Use ONLY the facts you are given. Never invent materials, sizes, colors, brands, warranty, certifications or technical specifications that were not provided.
Do not mention the price. Do not use markdown, emojis, bullet points or quotation marks.
Reply with the description text only.`;

exports.generateDescription = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const category = String(req.body.category || "").trim();
    const details = String(req.body.details || "").trim();

    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (name.length > 100 || category.length > 50 || details.length > 300) {
      return res.status(400).json({ message: "Input is too long" });
    }

    //.filter se empty string hat jaye gi, .trim() extra spaces remove karega
    const prompt = [
      `Product name: ${name}`,
      category && `Category: ${category}`,
      details && `Extra details from the seller: ${details}`,
    ]
      .filter(Boolean)
      .join("\n");

    //text ko cleanup markdowns remove karta hai
    const raw = await generateText(SYSTEM_RULES, prompt);
    const description = raw.replace(/[*_#`"]/g, "").trim();

    if (!description) {
      return res.status(502).json({ message: "AI returned an empty answer. Please try again." });
    }

    res.json({ description });
  } catch (error) {
    console.error("AI error:", error.status || "", error.message);

    if (error.status === 429) {
      return res.status(429).json({ message: "AI limit reached. Please try again later." });
    }
    res.status(502).json({
      message: "AI service is unavailable. Please try again or write the description yourself.",
    });
  }
};