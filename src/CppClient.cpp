#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <iostream>
#include <string>

using namespace std;

//Returns false if the connection is closed or an error occurs.
static bool read_line(int sock, string& out) {
    out.clear();
    char c;
    while (true) {
        ssize_t n = recv(sock, &c, 1, 0);
        //connection closed or error
        if (n <= 0) {
            return false;
        }
        //end of line
        if (c == '\n') {
            break;
        }
        out.push_back(c);
    }
    return true;
}
//Trim leading and trailing whitespace characters from a string.
static string trim(const string& s) {
    size_t first = s.find_first_not_of(" \t\r\n");
    //string is all whitespace
    if (first == string::npos) {
        return "";
    }
    size_t last = s.find_last_not_of(" \t\r\n");
    return s.substr(first, last - first + 1);
}

int main(int argc, char* argv[]) {
    //expect ./CppClient <ip> <port>
    if (argc != 3) {
        return 1;
    }
    const char* server_ip = argv[1];
    int port = stoi(argv[2]);
    //create TCP socket
    int sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock < 0) {
        return 1;
    }
    //build server address
    sockaddr_in server_addr{};
    server_addr.sin_family = AF_INET;
    server_addr.sin_port   = htons(port);
    //convert IP string to binary representation
    if (inet_pton(AF_INET, server_ip, &server_addr.sin_addr) <= 0) {
        close(sock);
        return 1;
    }
    //connect to the server
    if (connect(sock,
                reinterpret_cast<sockaddr*>(&server_addr),
                sizeof(server_addr)) < 0) {
        close(sock);
        return 1;
    }
    //read commands from stdin, send to server, print response
    string line;
    while (getline(cin, line)) {
        //remove leading/trailing whitespace (like Python's .strip())
        string trimmed = trim(line);
        if (trimmed.empty()) {
            continue; // skip empty lines
        }
        //each command must end with '\n' when sent to the server
        trimmed.push_back('\n');
        const char* data = trimmed.c_str();
        size_t len  = trimmed.size();
        size_t sent = 0;
        //ensure the whole command is sent (handle partial sends)
        while (sent < len) {
            ssize_t n = send(sock, data + sent, len - sent, 0);
            if (n <= 0) {
                //connection closed or error; exit client
                close(sock);
                return 0;
            }
            sent += static_cast<size_t>(n);
        }
        //read status lines from server
        string status;
        if (!read_line(sock, status)) {
            close(sock);
            return 0;
        }
        cout << status << "\n";
        //for the 200 responses lines we expect status line, empty separator line and content
        if (status.rfind("200 ", 0) == 0) {
            string empty_line;
            if (!read_line(sock, empty_line)) {
                close(sock);
                return 0;
            }
            cout << empty_line << "\n";
            string content;
            if (!read_line(sock, content)) {
                close(sock);
                return 0;
            }
            cout << content << "\n";
        }
    }
    //close socket before exit
    close(sock);
    return 0;
}