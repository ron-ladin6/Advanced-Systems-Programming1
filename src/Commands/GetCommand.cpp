#include "GetCommand.h"
//store reference to storage implementation
GetCommand::GetCommand(IStorage& storage_): storage(storage_) {
}
string GetCommand::execute(const string& command_input) {
    //treat the whole input string as file name
    string name = command_input;
    //if file name is empty, do nothing
    if(name.empty()) {
        return "400 Bad Request";
    }
    string content;
    //delegate the loading to storage
    try {
        content = storage.loadFile(name);
    }
        catch(...) {
            return "400 Bad Request";
        }
    //if file not found
    if (content.empty()) {
        return "404 Not Found";
    }
    //if there is content, display it
    return "200 Ok\n\n" + content;
}