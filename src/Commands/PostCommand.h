#ifndef POSTCOMMAND_H
#define POSTCOMMAND_H

#include "../Interfaces/ICommand.h"
#include "../Interfaces/IStorage.h"
#include <string>

using namespace std;
//command that saves text into a file using the storage object
class PostCommand : public ICommand {
public:
    //keep a reference to storage
    PostCommand(IStorage& storage_);
    //execute the add command
    string execute(const string& command_input) override;

private:
    IStorage& storage;
};
#endif