#ifndef CLIENTSERVICE_H
#define CLIENTSERVICE_H
#include "../Interfaces/IClientHandler.h"
#include "../Interfaces/ISocket.h"
#include "../Interfaces/IStorage.h"
#include "../Commands/CommandFactory.h"
#include <string>
#include <map>

using namespace std;

//client service that handle client connections and executes commands
class ClientService : public IClientHandler {
public:
    ClientService(IStorage& storage);
    ~ClientService() override;
    //handle client connection
    void handleClient(ISocket& socket) override;
private:
    //map of available commands
    map<string, ICommand*> commands;
};
#endif