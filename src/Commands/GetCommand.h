#ifndef GETCOMMAND_H
#define GETCOMMAND_H

#include "../Interfaces/ICommand.h"
#include "../Interfaces/IStorage.h"
#include <string>


using namespace std;

//command that loads file content using the storage object
class GetCommand : public ICommand {
public:
    //keep a reference to storage
    GetCommand(IStorage& storage_);
    //execute the get command, load file content from storage and display it
    string execute(const string& command_input) override;

private:
    IStorage& storage;
};

#endif