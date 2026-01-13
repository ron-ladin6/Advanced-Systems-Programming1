#include <gtest/gtest.h>
#include "../src/FilesWork/StreamFile.h"
#include <filesystem>

using namespace std;
namespace fs = std::filesystem;

// file which is used for multiple tests
class StreamFileTest : public ::testing::Test {
    protected:
        // file paths
        string testFile = "test_file.txt";
        string multiLineFile = "multi_line.txt";
        string nonExistantFile = "non_existant.txt";

        // clean up files between different tests
        void SetUp() override {
            if (fs::exists(testFile)) fs::remove(testFile);
            if (fs::exists(multiLineFile)) fs::remove(multiLineFile);
            if (fs::exists(nonExistantFile)) fs::remove(nonExistantFile);
        }
        void TearDown() override {
            if (fs::exists(testFile)) fs::remove(testFile);
            if (fs::exists(multiLineFile)) fs::remove(multiLineFile);
            if (fs::exists(nonExistantFile)) fs::remove(nonExistantFile);
        }
};

// Test 1: Constructor writes initial content into the file
TEST_F(StreamFileTest, ConstructorWritesContent) {
    StreamFile f(testFile);
    f.write_all("Hello");

    EXPECT_TRUE(fs::exists(testFile));
    EXPECT_EQ(f.read_all(), "Hello");
}

// Test 2: Constructor does not write when name is empty
TEST_F(StreamFileTest, ConstructorReceivesEmptyName) {
    StreamFile f("");

    // no file should be created and there is nothing to check with filesystem
    EXPECT_EQ(f.get_name(), "");
}

// Test 3: read_all reads multi-line content correctly
TEST_F(StreamFileTest, ReadAllMultiLine) {
    string content = "Line1\nLine2\nLine3";
    StreamFile f(multiLineFile);
    f.write_all(content);

    EXPECT_EQ(f.read_all(), content);
}

// Test 4: write_all overwrites file
TEST_F(StreamFileTest, WriteAllOverwrite) {
    StreamFile f(testFile);

    f.write_all("OldContent");
    EXPECT_EQ(f.read_all(), "OldContent");

    f.write_all("NewContent");
    EXPECT_EQ(f.read_all(), "NewContent");
}

// Test 5: read_all returns "" for non-existing file
TEST_F(StreamFileTest, ReadAllNonExistingFileReturnsEmpty) {
    StreamFile f(nonExistantFile);

    EXPECT_EQ(f.read_all(), "");
}

// Test 6: get_name returns correct name
TEST_F(StreamFileTest, GetNameReturnsCorrect) {
    StreamFile f(testFile);
    f.write_all("Hello");
    
    EXPECT_EQ(f.get_name(), testFile);
}
