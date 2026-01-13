#include "CommandFactory.h"
#include <map>
#include <string>
#include "PostCommand.h"
#include "GetCommand.h"
#include "SearchCommand.h"
#include "DeleteCommand.h"

using namespace std;
//this class create all the commands that exist in our project, to save reduce the code line in the main.
map<string, ICommand*> CommandFactory::create_commands(IStorage& storage) {
    map<string, ICommand*> commands;
    commands["post"] = new PostCommand(storage);
    commands["get"] = new GetCommand(storage);
    commands["search"] = new SearchCommand(storage);
    commands["delete"] = new DeleteCommand(storage);
    return commands;
}