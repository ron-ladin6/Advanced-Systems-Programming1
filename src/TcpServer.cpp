#include "TcpServer.h"
#include "Socket/TcpSocket.h"
#include <iostream>
#include <arpa/inet.h>

 TcpServer :: TcpServer (IThreadRun& threadRun , IStorage& storage) : threadRun(threadRun) , storage(storage)
, server_socket(-1) {}
    // Constructor 
TcpServer :: ~TcpServer () {
    // Destructor
    if (server_socket != -1) {
        close(server_socket);
    }
}
//this function create the server socket like we learned in the class, and call to acceptClients 
// that manager the clients connections.
void TcpServer :: start (int port){
    const char* ip_address = "0.0.0.0";
    const int port_no = port;
    // creat socket on IPv4 and TCP.
    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    //check if the socket is created successfully
    if (server_socket < 0) {
        perror("500 Internal Server Error");
        return;
    }
    // prepare the sockaddr_in structure for binding.
    struct sockaddr_in sin;
    memset(&sin, 0, sizeof(sin));
    sin.sin_family = AF_INET;
    sin.sin_addr.s_addr = inet_addr(ip_address);
    sin.sin_port = htons(port_no);
    // connect the socket to the address and port number.
    if (bind(server_socket, (struct sockaddr *) &sin, sizeof(sin)) < 0) {
        perror("500 Internal Server Error");
        return;
    }

    if (listen(server_socket, 5) < 0) {
        perror("500 Internal Server Error");
        return;
    }
    // start the loop and wait for clients.
    acceptClients();    
}

 void TcpServer :: acceptClients() {
    while (true) {
        // struct sockaddr_in to hold client address information
        struct sockaddr_in client_sin;
        socklen_t client_len = sizeof(client_sin);
        // accept a new client connection
        int client_socket = accept(server_socket, (struct sockaddr *) &client_sin, &client_len);
        //check if failed
        if (client_socket < 0) {
            perror("500 Internal Server Error");
            continue;
        }
       //thread.run create a new thread and run the code in the lambda.
       //we also inform the thread the client socket and the server to work with.
        threadRun.run([client_socket, this]() {
            TcpSocket clientTcpSocket(client_socket);
            ClientService clientService(this->storage);
            clientService.handleClient(clientTcpSocket);
        }); 


    }
 }