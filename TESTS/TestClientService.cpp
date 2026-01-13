#include <gtest/gtest.h>

#include "../src/ClientWork/ClientService.h"
#include "../src/Interfaces/IStorage.h"
#include "../src/Interfaces/ISocket.h"

#include <string>
#include <vector>
#include <map>
#include <queue>

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
        for (auto& [name, text] : files) {
            if (name.find(searchText) != string::npos ||
                text.find(searchText) != string::npos) {
                result.push_back(name);
            }
        }
        return result;
    }
};

class FakeSocket : public ISocket {
public:
    queue<string> incoming;
    vector<string> outgoing;
    bool closed = false;
    explicit FakeSocket(const vector<string>& requests) {
        for (auto& r : requests) {
            incoming.push(r);
        }
    }
    string receive_data() override {
        if (incoming.empty()) return "";
        string msg = incoming.front();
        incoming.pop();
        return msg;
    }
    void send_data(const string& data) override {
        outgoing.push_back(data);
    }
    void close_socket() override {
        closed = true;
    }
};

TEST(TestClientService, PostGetDeleteFlowCaseInsensitive) {
    FakeStorage storage;
    ClientService service(storage);
    FakeSocket socket({
        "POST alpha.txt hello world",
        "get alpha.txt",
        "SeArCh hello",
        "DELETE alpha.txt",
        "search hello"
    });

    service.handleClient(socket);
    ASSERT_EQ(socket.outgoing.size(), 5u);
    EXPECT_EQ(socket.outgoing[0].substr(0, 3), "201");
    EXPECT_EQ(socket.outgoing[1].substr(0, 3), "200");
    EXPECT_NE(socket.outgoing[1].find("hello world"), string::npos);
    EXPECT_EQ(socket.outgoing[2][0], '2');
    EXPECT_NE(socket.outgoing[2].find("alpha.txt"), string::npos);
    EXPECT_EQ(socket.outgoing[3][0], '2');
    EXPECT_EQ(socket.outgoing[4][0], '2');
    EXPECT_EQ(socket.outgoing[4].find("alpha.txt"), string::npos);
    EXPECT_TRUE(storage.files.empty());
    EXPECT_TRUE(socket.closed);
}

TEST(TestClientService, UnknownCommandReturns400) {
    FakeStorage storage;
    ClientService service(storage);
    FakeSocket socket({ "unknown something" });
    service.handleClient(socket);
    ASSERT_EQ(socket.outgoing.size(), 1u);
    EXPECT_EQ(socket.outgoing[0], "400 Bad Request\n");
    EXPECT_TRUE(socket.closed);
}