#ifndef ICOMMAND_H
#define ICOMMAND_H

#include <string>

using namespace std;

//base interface for all CLI commands
class ICommand{
public:
virtual ~ICommand() = default;
//execute the command using the rest of the CLI line as input
virtual string execute(const string& command_input) = 0;
};
#endif