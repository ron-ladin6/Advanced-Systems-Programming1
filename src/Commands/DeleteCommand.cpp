#include "DeleteCommand.h"
#include <string>
using namespace std;


DeleteCommand::DeleteCommand(IStorage& storage_): storage(storage_) {
}
string DeleteCommand::execute(const string& command_input) {
    string name = command_input;
    //if file name is empty, do nothing
    if (name.empty()) {
        return "400 Bad Request";
    }
    bool removed = false;
    //attempt to delete the file
    try {
        //delegate the deletion to storage
        removed = storage.deleteFile(name);
    }
    catch (...) {
        //if there was an exception, unlock the mutex and return error
        return "400 Bad Request";
    }
    //if deleted
    if (removed) {
        return "204 No Content";
    //if not found
    } else {
        return "404 Not Found";
    }
}