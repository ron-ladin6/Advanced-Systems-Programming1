const mongoose = require("mongoose");
const User = require("../../models/user");

class MongoUserStore {
  docToObj(doc) {
    if (!doc) return null;
    return doc.toObject ? doc.toObject() : doc;
  }

  async create(user) {
    const id = new mongoose.Types.ObjectId().toString();

    const newUser = new User({
      _id: id,
      username: user.username,
      email: user.email,
      passwordHash: user.password || user.passwordHash,
      image: user.image || user.profilePictureURL || "",
      displayName: user.displayName || user.username,
    });

    await newUser.save();
    return this.docToObj(newUser);
  }

  async findById(id) {
    const user = await User.findById(id);
    return this.docToObj(user);
  }

  async findByLogin(login) {
    const user = await User.findOne({
      $or: [{ username: login }, { email: login }],
    });
    return this.docToObj(user);
  }
}

module.exports = MongoUserStore;
