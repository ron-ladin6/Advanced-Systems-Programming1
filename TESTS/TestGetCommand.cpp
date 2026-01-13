#include <gtest/gtest.h>
#include <filesystem>

#include "../src/Commands/PostCommand.h"
#include "../src/Commands/GetCommand.h"
#include "../src/FilesWork/FileStorage.h"
#include "../src/Interfaces/ICompressor.h"
#include "../src/Interfaces/IStorage.h"

using namespace std;
namespace fs = std::filesystem;

class DummyCompressor : public ICompressor {
public:
    string compress(const string& data) override { return data; }
    string decompress(const string& data) override { return data; }
};

class GetCommandFileStorageTest : public ::testing::Test {
protected:
    fs::path tempDir;
    DummyCompressor compressor;
    FileStorage* storage;
    PostCommand* postCmd;
    GetCommand* getCmd;

    void SetUp() override {
        tempDir = fs::temp_directory_path() / "get_command_test";
        fs::create_directories(tempDir);

        storage = new FileStorage(tempDir.string(), compressor);
        postCmd = new PostCommand(*storage);
        getCmd  = new GetCommand(*storage);
    }

    void TearDown() override {
        delete getCmd;
        delete postCmd;
        delete storage;
        fs::remove_all(tempDir);
    }
};

// Test: existing file returns 200 Ok and its content
TEST_F(GetCommandFileStorageTest, ExistingFileReturns200AndContent) {
    postCmd->execute("a.txt Hello");

    string result = getCmd->execute("a.txt");

    EXPECT_EQ(result, "200 Ok\n\nHello");
}

// Test: non-existing file returns 404
TEST_F(GetCommandFileStorageTest, NonExistingFileReturns404) {
    string result = getCmd->execute("missing.txt");

    EXPECT_EQ(result, "404 Not Found");
}

// Test: empty input returns 400
TEST_F(GetCommandFileStorageTest, EmptyInputReturns400) {
    string result = getCmd->execute("");

    EXPECT_EQ(result, "400 Bad Request");
}

// -------- exception path with fake storage ----------

class ThrowingStorageForGet : public IStorage {
public:
    void saveFile(const string&, const string&) override {}
    string loadFile(const string&) override { throw runtime_error("fail"); }
    vector<string> searchFile(const string&) override { return {}; }
    bool deleteFile(const string&) override { return false; }
};

TEST(GetCommandExceptionTest, StorageThrowsReturns400) {
    ThrowingStorageForGet storage;
    GetCommand cmd(storage);

    string result = cmd.execute("file.txt");

    EXPECT_EQ(result, "400 Bad Request");
}