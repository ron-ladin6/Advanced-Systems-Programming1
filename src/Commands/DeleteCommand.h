#include "../Interfaces/ICommand.h"
#include "../Interfaces/IStorage.h"
#include <string>

class DeleteCommand : public ICommand {
public:
    //delete command constructor
    DeleteCommand(IStorage& storage_);
    //execute delete command
    string execute(const string& command_input) override;
private:
    IStorage& storage;
};