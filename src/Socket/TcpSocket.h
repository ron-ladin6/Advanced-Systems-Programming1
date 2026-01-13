#ifndef TCPSOCKET_H
#define TCPSOCKET_H
#include "../Interfaces/ISocket.h"
#include <iostream>
#include <cstring>
#include <sys/socket.h>
#include <unistd.h>
using namespace std;
//implementation of ISocket for TCP sockets
class TcpSocket : public ISocket 
{
    private:
    int sock_id;
    public: 
    explicit TcpSocket(int socket_id): sock_id(socket_id){}
    ~TcpSocket() {
        close_socket();
    }

    void send_data(const string &data) override;
    string receive_data() override;
    void close_socket() override;
};
#endif
