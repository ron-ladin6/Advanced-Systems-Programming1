#ifndef COMMANDFACTORY_H
#define COMMANDFACTORY_H

#include <map>
#include <string>
#include "../Interfaces/ICommand.h"
#include "../Interfaces/IStorage.h"
using namespace std;
class CommandFactory {
public:
static map<string, ICommand*> create_commands(IStorage& storage);
};

#endif  