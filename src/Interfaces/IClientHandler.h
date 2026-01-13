#ifndef ICLIENTHANDLER_H
#define ICLIENTHANDLER_H
#include <string>
#include "ISocket.h"

using namespace std;

//interface for client handler class
class IClientHandler {
public:
    virtual ~IClientHandler() = default;
    //handle client connection
    virtual void handleClient(ISocket& socket) = 0;
};
#endif