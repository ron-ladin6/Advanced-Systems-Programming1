//check if user can access file
function canAccess(file, userId, action) {
    //if no file
    if (!file) 
        return false;
    //check if owner or has permission
    const isOwner = file.ownerId === userId;
    if (isOwner) 
        return true;
    //check permissions
    const perms = file.permissions || [];
    const p = perms.find((x) => x.userId === userId);
    //if no permission
    if (!p) 
        return false;
    //check action
    if (action === "read") 
        return true;
    //check write
    if (action === "write") 
        return p.role === "write";
    //own not allowed
    if (action === "own") 
        return false;
    return false;
}
//make available
module.exports = canAccess;