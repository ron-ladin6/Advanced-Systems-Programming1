#include <gtest/gtest.h>
#include <sys/socket.h>
#include <unistd.h>
#include <string>

#include "../src/Socket/TcpSocket.h"

using namespace std;

// Test that send_data sends the full message over the socket
TEST(TcpSocketTest, SendDataSendsFullMessage) {
    int fds[2];
    ASSERT_EQ(socketpair(AF_UNIX, SOCK_STREAM, 0, fds), 0) << "socketpair failed";
    int client_fd = fds[0];
    int server_fd = fds[1];
    {
        TcpSocket client(client_fd);
        string message = "Im a message\n";
        client.send_data(message);
        // Read from the other end of the socket
        string received;
        char buffer[128];
        ssize_t n = recv(server_fd, buffer, sizeof(buffer), 0);
        ASSERT_GT(n, 0);
        received.assign(buffer, buffer + n);
        EXPECT_EQ(received, message);
    }
    close(server_fd);
    // client_fd is closed by TcpSocket destructor
}
// Test that receive_data reads until '\n' and returns the line without newline
TEST(TcpSocketTest, ReceiveDataReadsUntilNewline) {
    int fds[2];
    ASSERT_EQ(socketpair(AF_UNIX, SOCK_STREAM, 0, fds), 0) << "socketpair failed";
    int client_fd = fds[0];
    int server_fd = fds[1];
    string toSend = "HELLO FROM CLIENT\n";
    {
        // Act as "server" on server_fd
        TcpSocket server(server_fd);
        // Send from the other side
        ssize_t sent = send(client_fd, toSend.c_str(), toSend.size(), 0);
        ASSERT_EQ(sent, static_cast<ssize_t>(toSend.size()));
        string received = server.receive_data();
        EXPECT_EQ(received, "HELLO FROM CLIENT");
    }
    close(client_fd);
}