const crypto = require("crypto");

class UserService {
  constructor(userStore) {
    //save store
    this.userStore = userStore;
  }

  _hashPassword(password) {
    //hash password using sha256
    return crypto.createHash("sha256").update(String(password)).digest("hex");
  }

  async register({
    username,
    email,
    password,
    verifyPassword,
    displayName,
    profilePictureURL,
  } = {}) {
    //checking if valid
    const u = typeof username === "string" ? username.trim() : "";
    const e = typeof email === "string" ? email.trim() : "";
    const d = typeof displayName === "string" ? displayName.trim() : "";
    const img =
      typeof profilePictureURL === "string" ? profilePictureURL.trim() : "";
    //if not valid, return null
    if (!u || !e || !password) return null;
    if (typeof verifyPassword !== "string" || password !== verifyPassword)
      return null;
    //check if user exists
    const newUser = await this.userStore.create({
      username: u,
      email: e,
      passwordHash: this._hashPassword(password),
      displayName: d || u,
      image: img || "",
    });
    //return new user
    return newUser;
  }
  //login user
  async login(login, password) {
    if (typeof login !== "string" || typeof password !== "string") return null;
    //delete spaces
    const key = login.trim();
    //if empty
    if (!key) return null;
    //find user by login
    const user = await this.userStore.findByLogin(key);
    //if not found
    if (!user) return null;
    //check password
    const inputHash = this._hashPassword(password);
    //if not match
    if (inputHash !== user.passwordHash) return null;
    //return user data
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      image: user.image,
    };
  }

  getById(id) {
    //get user by id
    return this.userStore.findById(id);
  }
}

//make available
module.exports = UserService;
