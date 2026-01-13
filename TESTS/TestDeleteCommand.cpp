#include <gtest/gtest.h>
#include <filesystem>
#include <fstream>

#include "../src/Commands/DeleteCommand.h"
#include "../src/FilesWork/FileStorage.h"
#include "../src/Interfaces/ICompressor.h"
#include "../src/Interfaces/IStorage.h"

using namespace std;
namespace fs = std::filesystem;

// Simple compressor used in tests: no real compression
class DummyCompressor : public ICompressor {
public:
    string compress(const string& data) override { return data; }
    string decompress(const string& data) override { return data; }
};

// Fixture for DeleteCommand with real FileStorage
class DeleteCommandFileStorageTest : public ::testing::Test {
protected:
    fs::path tempDir;
    DummyCompressor compressor;
    FileStorage* storage;
    DeleteCommand* command;

    void SetUp() override {
        tempDir = fs::temp_directory_path() / "delete_command_test";
        fs::create_directories(tempDir);
        storage = new FileStorage(tempDir.string(), compressor);
        command = new DeleteCommand(*storage);
    }

    void TearDown() override {
        delete command;
        delete storage;
        fs::remove_all(tempDir);
    }

    bool fileExists(const string& name) const {
        return fs::exists(tempDir / name);
    }
};

// Test: deleting an existing file returns 204 and removes the file
TEST_F(DeleteCommandFileStorageTest, DeleteExistingFileReturns204AndRemovesFile) {
    // create a file using std::ofstream
    const string filename = "file.txt";
    {
        ofstream out(tempDir / filename);
        out << "some content";
    }
    ASSERT_TRUE(fileExists(filename));

    string result = command->execute(filename);

    EXPECT_EQ(result, "204 No Content");
    EXPECT_FALSE(fileExists(filename));
}

// Test: deleting a non-existing file returns 404
TEST_F(DeleteCommandFileStorageTest, DeleteNonExistingFileReturns404) {
    const string filename = "does_not_exist.txt";
    ASSERT_FALSE(fileExists(filename));

    string result = command->execute(filename);

    EXPECT_EQ(result, "404 Not Found");
    EXPECT_FALSE(fileExists(filename));
}

// Test: empty input returns 400 and does not change the directory
TEST_F(DeleteCommandFileStorageTest, EmptyInputReturns400) {
    EXPECT_TRUE(fs::is_empty(tempDir));

    string result = command->execute("");

    EXPECT_EQ(result, "400 Bad Request");
    EXPECT_TRUE(fs::is_empty(tempDir));
}

// --------- Exception path coverage using a fake storage ----------

class ThrowingStorage : public IStorage {
public:
    void saveFile(const string&, const string&) override {}
    string loadFile(const string&) override { return ""; }
    vector<string> searchFile(const string&) override { return {}; }
    bool deleteFile(const string&) override {
        throw runtime_error("delete failed");
    }
};

// Test: when storage throws, DeleteCommand returns 400
TEST(DeleteCommandExceptionTest, StorageThrowsReturns400) {
    ThrowingStorage storage;
    DeleteCommand command(storage);

    string result = command.execute("something.txt");

    EXPECT_EQ(result, "400 Bad Request");
}