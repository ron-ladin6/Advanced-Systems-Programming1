#ifndef SEARCHCOMMAND_H
#define SEARCHCOMMAND_H

#include "../Interfaces/ICommand.h"
#include "../Interfaces/IStorage.h"
#include <string>
#include <vector>
using namespace std;

//command that searches for text in all files using the storage object
class SearchCommand : public ICommand {
public:
    //keep a reference to storage
    SearchCommand(IStorage& storage_);
    //execute the search command: call storage.searchFile(...)
    string execute(const string& command_input) override;

private:
    IStorage& storage;
};

#endif