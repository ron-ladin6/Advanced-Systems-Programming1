#ifndef ISERVER_H
#define ISERVER_H

class IServer {
    public: 
    virtual ~IServer () = default;
    virtual void start(int port)= 0;
    
};

#endif