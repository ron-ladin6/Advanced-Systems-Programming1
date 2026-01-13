#include <gtest/gtest.h>
#include <thread>
#include <atomic>
#include <chrono>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string>
#include <map>
#include <vector>

#include "../src/TcpServer.h"
#include "../src/Interfaces/IStorage.h"
#include "../src/Utils/ThreadPool.h"

using namespace std;

class FakeStorage : public IStorage {
public:
    map<string, string> files;

    void saveFile(const string& name, const string& text) override {
        files[name] = text;
    }

    string loadFile(const string& name) override {
        auto it = files.find(name);
        return it == files.end() ? string() : it->second;
    }

    bool deleteFile(const string& name) override {
        return files.erase(name) > 0;
    }

    vector<string> searchFile(const string& searchText) override {
        vector<string> result;
        for (auto& p : files) {
            if (p.first.find(searchText) != string::npos ||
                p.second.find(searchText) != string::npos) {
                result.push_back(p.first);
            }
        }
        return result;
    }
};

static bool readStatusLine(int sock, string& out) {
    out.clear();
    char c;
    while (true) {
        ssize_t n = recv(sock, &c, 1, 0);
        if (n <= 0) return false;
        if (c == '\n') break;
        out.push_back(c);
    }
    return true;
}

TEST(TcpServerTest, MultipleClients) {
    FakeStorage storage;

    ThreadPool pool(4);
    TcpServer server(pool, storage);

    int port = 9091;

    thread serverThread([&server, port]() {
        try {
            server.start(port);
        } catch (...) {
        }
    });

    this_thread::sleep_for(chrono::milliseconds(200));

    atomic<bool> allOk(true);

    auto clientTask = [&](int id) {
        int sock = socket(AF_INET, SOCK_STREAM, 0);
        if (sock < 0) {
            allOk = false;
            return;
        }

        sockaddr_in addr{};
        addr.sin_family = AF_INET;
        addr.sin_port = htons(port);
        inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);

        if (connect(sock, reinterpret_cast<sockaddr*>(&addr), sizeof(addr)) < 0) {
            allOk = false;
            close(sock);
            return;
        }

        string fileName = "file" + to_string(id);
        string cmd = "POST " + fileName + " hello\n";

        ssize_t sent = send(sock, cmd.c_str(), cmd.size(), 0);
        if (sent != static_cast<ssize_t>(cmd.size())) {
            allOk = false;
            close(sock);
            return;
        }

        string status;
        if (!readStatusLine(sock, status)) {
            allOk = false;
            close(sock);
            return;
        }

        if (status.rfind("201", 0) != 0) {
            allOk = false;
        }

        close(sock);
    };

    const int NUM_CLIENTS = 5;
    vector<thread> clients;
    clients.reserve(NUM_CLIENTS);

    for (int i = 0; i < NUM_CLIENTS; ++i) {
        clients.emplace_back(clientTask, i);
    }
    for (auto& t : clients) {
        t.join();
    }

    EXPECT_TRUE(allOk);

    serverThread.detach(); // server.start blocks forever in your current implementation
}