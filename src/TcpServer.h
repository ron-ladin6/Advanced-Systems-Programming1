#ifndef TCPSERVER_H
#define TCPSERVER_H
#include "Interfaces/IServer.h"
#include "Interfaces/IThreadRun.h"
#include "Interfaces/IStorage.h"
#include "ClientWork/ClientService.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#include <cstring>

class TcpServer : public IServer {
private:
    int server_socket;
    IThreadRun& threadRun;
    IStorage& storage;
    void acceptClients();

public: 
    TcpServer(IThreadRun& threadRun, IStorage& storage);
    virtual ~TcpServer ();
    void start (int port) override;
};

#endif