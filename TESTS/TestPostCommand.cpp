#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>

#include "../src/Commands/PostCommand.h"
#include "../src/FilesWork/FileStorage.h"
#include "../src/Interfaces/ICompressor.h"

using namespace std;
namespace fs = std::filesystem;

// Dummy compressor: passthrough implementation
class DummyCompressor : public ICompressor {
public:
    string compress(const string& data) override { return data; }
    string decompress(const string& data) override { return data; }
};
class PostCommandTest : public ::testing::Test {
protected:
    fs::path tempDir;
    DummyCompressor compressor;
    FileStorage* storage;
    PostCommand* command;
    void SetUp() override {
        tempDir = fs::temp_directory_path() / "post_command_test";
        fs::create_directories(tempDir);
        storage = new FileStorage(tempDir.string(), compressor);
        command = new PostCommand(*storage);
    }
    void TearDown() override {
        delete command;
        delete storage;
        fs::remove_all(tempDir);
    }
    string readFile(const string& filename) const {
        auto path = tempDir / filename;
        if (!fs::exists(path)) return "";
        ifstream in(path);
        return string((istreambuf_iterator<char>(in)),
                      istreambuf_iterator<char>());
    }
};
// Test: valid input with filename and content
TEST_F(PostCommandTest, ValidInputCreatesFileAndReturns201) {
    string result = command->execute("file1.txt Hello world");
    EXPECT_EQ(result, "201 Created");
    EXPECT_TRUE(fs::exists(tempDir / "file1.txt"));
    EXPECT_EQ(readFile("file1.txt"), "Hello world");
}
// Test: only filename, no content
TEST_F(PostCommandTest, OnlyFilenameCreatesEmptyFile) {
    string result = command->execute("empty.txt");
    EXPECT_EQ(result, "201 Created");
    EXPECT_TRUE(fs::exists(tempDir / "empty.txt"));
    EXPECT_EQ(readFile("empty.txt"), "");
}
// Test: empty input returns 400 and does nothing
TEST_F(PostCommandTest, EmptyInputReturns400) {
    EXPECT_TRUE(fs::is_empty(tempDir));
    string result = command->execute("");
    EXPECT_EQ(result, "400 Bad Request");
    EXPECT_TRUE(fs::is_empty(tempDir));
}
// Test: existing file is not overwritten by FileStorage logic
TEST_F(PostCommandTest, ExistingFileIsNotOverwritten) {
    // first write some content
    {
        ofstream out(tempDir / "same.txt");
        out << "original";
    }
    string result = command->execute("same.txt new content");
    //dont overwrite and return 400
    EXPECT_EQ(result, "400 Bad Request");
    EXPECT_TRUE(fs::exists(tempDir / "same.txt"));
    EXPECT_EQ(readFile("same.txt"), "original");
}