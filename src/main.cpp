#include <iostream>
#include <cstdlib> 
#include "Interfaces/IStorage.h"
#include "FilesWork/FileStorage.h"
#include "compression/RLECompressor.h"
#include "Utils/ThreadPool.h" 
#include "TcpServer.h"

using namespace std;
int main(int argc, char* argv[]) {
    int port;
    //check if port is given as command line argument, else use default port 8080
    if (argc < 2) {
       port = 8080; // default port
    }
    else {
        //get port from command line arguments
        port = atoi(argv[1]);
    }
    //get base path from environment variable
    const char* envPath = getenv("FILES_BASE_PATH");
    string basePath;
    
    if (envPath) {
        basePath = envPath;
    } else {
        basePath = "storage";
    }
    //create storage ,compressor and thread creator objects
    RLECompressor compressor;
    FileStorage storage(basePath, compressor);
    //determine number of threads in the pool
    auto n = thread::hardware_concurrency();
    //if unable to determine, use 4 as default
    if (n == 0) n = 4;
    //create thread pool
    ThreadPool pool(n);
    //create server
    TcpServer server(pool, storage);
    //start the server, listen to the port and accept clients
    server.start(port);
    return 0;
}