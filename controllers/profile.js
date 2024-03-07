const User = require("../models/User");

module.exports = {
  //Updates user displayName, Bio, or featured Link
  editUserProfile: async (req, res) => {
    const userId = req.user.id;
    const { newDisplayName, newProfileLink, newProfileBio } = req.body;
    try {
      await User.findByIdAndUpdate(userId, {
        displayName: newDisplayName,
        profileLink: newProfileLink,
        profileBio: newProfileBio,
      });
      console.log(`ran editUserProfile for ${userId}`);
      return res.redirect("/feed/profile/" + userId);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  },
};
