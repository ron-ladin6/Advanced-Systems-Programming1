class InMemoryUserStore {
  constructor() {
    //init maps
    this.byId = new Map();
    this.byLogin = new Map();
    //maintain next id
    this.nextId = 1;
  }
  _norm(s) {
    //make string lowercase and trimmed
    if (s === undefined || s === null) 
        return "";
    return String(s).trim().toLowerCase();
  }
  //create a new user
create({ username, email, passwordHash, image, displayName }) {
    //normalize inputs
    const u = this._norm(username);
    const e = this._norm(email);
    //validate fields
    if (!u || !e || !passwordHash) 
        return null;
    //validate image
    if (typeof image !== "string" || !image.trim()) 
        return null;
    //validate display name
    if (typeof displayName !== "string" || !displayName.trim()) 
        return null;

    // duplicate by username or email (case/space-insensitive)
    if (this.byLogin.has(u) || this.byLogin.has(e)) 
        return null;

    //generate id
    const id = String(this.nextId++);
    //create user object
    const user = {
      id,
      username: String(username).trim(),
      email: String(email).trim(),
      passwordHash: String(passwordHash),
      image: String(image).trim(),
      displayName: String(displayName).trim(),
    };

    //save to maps
    this.byId.set(id, user);
    this.byLogin.set(u, id);
    this.byLogin.set(e, id);

    // return public user
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      image: user.image,
    };
  }

  //find user by id
  findById(id) {
    const user = this.byId.get(String(id));
    if (!user) return null;
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      image: user.image,
    };
  }
  //find user by login
  findByLogin(login) {
    //normalize key
    const key = this._norm(login);
    if (!key) 
        return null;
    //get id from login map
    const id = this.byLogin.get(key);
    if (!id) 
        return null;
    //return user
    return this.byId.get(id) || null;
  }
}
//make available
module.exports = InMemoryUserStore;