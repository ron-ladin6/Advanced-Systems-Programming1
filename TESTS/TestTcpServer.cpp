#include <gtest/gtest.h>
#include <thread>
#include <chrono>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string>
#include <cstring>
#include <iostream>
#include "../src/TcpServer.h"
#include "../src/DedicatedThreadRunner.h"
#include "../src/Interfaces/IStorage.h"

// Mock storage class for testing
class TestStorage : public IStorage {
public:
    // Empty implementation is enough for this test
};

TEST(TcpServerTests, Server_Full_Integration_Test) {
    // 1. Setup: Initialize the server and dependencies
    DedicatedThreadRunner realRunner;
    TestStorage dummyStorage;
    TcpServer server(realRunner, dummyStorage);
    
    int port = 9090;

    // 2. Start Server: Run in a separate thread to avoid blocking the test
    std::thread serverThread([&server, port]() {
        try {
            server.start(port);
        } catch (...) {
        }
    });

    // Wait for the server to bind and listen
    std::this_thread::sleep_for(std::chrono::milliseconds(200));

    //Create Client Standard C++ socket creation
    int clientSock = socket(AF_INET, SOCK_STREAM, 0);
    ASSERT_GE(clientSock, 0);

    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);

    //ConnectThis checks if 'acceptClients' is working
    int connectResult = connect(clientSock, (struct sockaddr*)&addr, sizeof(addr));
    ASSERT_EQ(connectResult, 0) << "Failed to connect to server";

    //Send Data Send a command to test input handling
    std::string msg = "TEST_COMMAND args\n";
    ssize_t sentBytes = send(clientSock, msg.c_str(), msg.length(), 0);
    ASSERT_EQ(sentBytes, msg.length());

    //Receive Data Verify the server sends a response back
    char buffer[1024] = {0};
    ssize_t bytesRead = read(clientSock, buffer, sizeof(buffer) - 1);

    ASSERT_GT(bytesRead, 0) << "Server accepted but didn't reply";

    //Cleanup Close client socket and detach server thread
    close(clientSock);
    serverThread.detach();
}