#include "SearchCommand.h"
//store reference to storage implementation
SearchCommand::SearchCommand(IStorage& storage_): storage(storage_) {
}
string SearchCommand::execute(const string& command_input) {
    //treat the whole input string as search text
    string searchText = command_input;
    string response = "";
     //if we search empty string print error
    if(searchText.empty() ) {
        return "400 Bad Request";
    }
    vector<string> results;
    //ask storage to search and get the matching file names
    try{
        results = storage.searchFile(searchText);
    }
        catch(...) {
          return "400 Bad Request";
        }
    
    //flag to aviod extra space;
    bool first = true;
    //display each matching file name through the menu
    for (const string& file : results) {
        if (!first) {
            response += " ";
        }
        response += file;
        first = false;
    }
    return "200 Ok\n\n" + response;
}