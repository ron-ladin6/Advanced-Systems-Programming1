#include "gtest/gtest.h"
#include "CreateThread.h"

#include <atomic>
#include <chrono>
#include <thread>
#include <functional>

using namespace std;

TEST(TestCreateThread, RunExecutesFunctionOnce) {
    CreateThread creator;
    atomic<int> counter{0};
    creator.run([&]() {
        ++counter;
    });
    // Give the detached thread a short time to run
    this_thread::sleep_for(chrono::milliseconds(30));
    EXPECT_EQ(counter.load(), 1);
}
TEST(TestCreateThread, RunCanBeCalledMultipleTimes) {
    CreateThread creator;

    atomic<int> counter{0};

    for (int i = 0; i < 5; ++i) {
        creator.run([&]() {
            ++counter;
        });
    }
    this_thread::sleep_for(chrono::milliseconds(50));
    EXPECT_EQ(counter.load(), 5);
}