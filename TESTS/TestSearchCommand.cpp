#include <gtest/gtest.h>
#include <filesystem>

#include "../src/Commands/PostCommand.h"
#include "../src/Commands/SearchCommand.h"
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

class SearchCommandFileStorageTest : public ::testing::Test {
protected:
    fs::path tempDir;
    DummyCompressor compressor;
    FileStorage* storage;
    PostCommand* postCmd;
    SearchCommand* searchCmd;

    void SetUp() override {
        tempDir = fs::temp_directory_path() / "search_command_test";
        fs::create_directories(tempDir);

        storage   = new FileStorage(tempDir.string(), compressor);
        postCmd   = new PostCommand(*storage);
        searchCmd = new SearchCommand(*storage);
    }

    void TearDown() override {
        delete searchCmd;
        delete postCmd;
        delete storage;
        fs::remove_all(tempDir);
    }
};

// Test: single match returns 200 and contains the file name
TEST_F(SearchCommandFileStorageTest, SingleMatchReturnsFileName) {
    postCmd->execute("alpha.txt Hello world");
    postCmd->execute("beta.txt Goodbye");

    string result = searchCmd->execute("Hello");

    EXPECT_NE(result.find("200 Ok\n\n"), string::npos);
    EXPECT_NE(result.find("alpha.txt"), string::npos);
    // beta.txt should not appear
    EXPECT_EQ(result.find("beta.txt"), string::npos);
}

// Test: no matches still returns 200 with empty body
TEST_F(SearchCommandFileStorageTest, NoMatchesReturnsEmptyBodyBut200) {
    postCmd->execute("file.txt Something else");

    string result = searchCmd->execute("not_present");

    EXPECT_EQ(result, "200 Ok\n\n");
}

// Test: empty input returns 400
TEST_F(SearchCommandFileStorageTest, EmptyInputReturns400) {
    string result = searchCmd->execute("");

    EXPECT_EQ(result, "400 Bad Request");
}

// -------- exception path with fake storage ----------

class ThrowingStorageForSearch : public IStorage {
public:
    void saveFile(const string&, const string&) override {}
    string loadFile(const string&) override { return ""; }
    vector<string> searchFile(const string&) override {
        throw runtime_error("search failed");
    }
    bool deleteFile(const string&) override { return false; }
};

TEST(SearchCommandExceptionTest, StorageThrowsReturns400) {
    ThrowingStorageForSearch storage;
    SearchCommand cmd(storage);

    string result = cmd.execute("anything");

    EXPECT_EQ(result, "400 Bad Request");
}