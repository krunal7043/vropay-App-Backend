const Interest = require("../model/Interest");
const User = require("../model/userSchema");

exports.getAllInterests = async (req, res) => {
  try {
    const interests = await Interest.find({ deletedAt: null });

    res.status(200).json({
      success: true,
      interests,
    });
  } catch (error) {
    console.error("Get interests error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.updateUserInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    const userId = req.userId;

    if (!interests || !Array.isArray(interests)) {
      return res
        .status(400)
        .json({ success: false, message: "Interests array is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { interests },
      { new: true }
    ).populate("interests");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Interests add successfully",
      interests: user.interests,
    });
  } catch (error) {
    console.error("adding interests error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.createInterest = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Interest name is required" });
    }

    const interest = await Interest.create({ name });

    res.status(201).json({
      success: true,
      message: "Interest created successfully",
      interest,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Interest already exists" });
    }
    console.error("Create interest error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
