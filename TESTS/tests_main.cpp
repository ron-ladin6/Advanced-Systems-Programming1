#include <gtest/gtest.h>
#include <iostream>

int main(int argc, char** argv) {
    std::cout << "==== Starting GoogleTest suite ====" << std::endl;
    ::testing::InitGoogleTest(&argc, argv);
    int result = RUN_ALL_TESTS();
    std::cout << "==== Finished GoogleTest suite, exit code = "
              << result << " ====" << std::endl;
    return result;
}