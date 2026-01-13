#ifndef ISOCKET_H
#define ISOCKET_H
#include <string>
using namespace std;
//interface for socket operations
class ISocket {
public:
    virtual ~ISocket() = default;
    //send data through the socket
    virtual void send_data(const string &data) = 0;
    //receive data from the socket
    virtual string receive_data() = 0;
    // close the socket connection
    virtual void close_socket() = 0;
};
#endif