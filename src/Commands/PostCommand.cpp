#include "PostCommand.h"

//store reference to storage implementation
PostCommand::PostCommand(IStorage& storage_): storage(storage_) {
}
string PostCommand::execute(const string& command_input) {
    //split the input into file name and content
    size_t firstSpace = command_input.find(' ');
    string name;
    string text;
    if(firstSpace == string::npos) {
        //only file name was given, no content
        name = command_input;
        text = "";
    } else {
        //take part before space as file name
        name = command_input.substr(0, firstSpace);
        //take the rest (can contain spaces) as file content
        text = command_input.substr(firstSpace + 1);
    }
    //if file already exists, return error
    if(!storage.loadFile(name).empty()) {
        return "400 Bad Request";
    }
    //if no file name was given, do nothing
    if(name.empty()) {
        return "400 Bad Request";
    }
    //delegate the saving to storage
    try {storage.saveFile(name, text);}
        catch(...) {
            return "400 Bad Request";
        }
    //return success
    return "201 Created";
}