#include "ClientService.h"
#include <cctype>

using std::string;
using std::map;

ClientService::ClientService(IStorage& storage){
    //initialize the commands map using the factory
    commands = CommandFactory::create_commands(storage);
}

ClientService::~ClientService(){
    //delete all command objects to free memory
    for (auto& pair : commands) {
        delete pair.second;
    }
}

void ClientService::handleClient(ISocket& socket){
    while (true) {
        //read request from client
        string request = socket.receive_data();
        if (request.empty()) {
            break;
        }
        //remove trailing newlines and carriage returns
        while (!request.empty() && (request.back() == '\n' || request.back() == '\r')) {
            request.pop_back();
        }
        string command_name;
        string command_args;
        //split request into command name and arguments
        size_t space_pos = request.find(' ');
        //handle case with no arguments
        if (space_pos == string::npos) {
            command_name = request;
            command_args = "";
        //handle case with arguments
        } else {
            command_name = request.substr(0, space_pos);
            command_args = request.substr(space_pos + 1);
        }
        string response;
        //our program is non case sensitive , we save the command name in the map with lower case
        //so to match we convert its by deafault to lower case.
        for ( char& c : command_name){
            c = tolower(c);
        }
        //find and execute the command
        auto it = commands.find(command_name);
        //if command not found
        if (it == commands.end()) {
            response = "400 Bad Request";
        //if command found
        } else {
            response = it->second->execute(command_args);
        }
        //send response to client
        socket.send_data(response + "\n");
    }
    //close the socket connection
    socket.close_socket();
}
