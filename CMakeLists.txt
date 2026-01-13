cmake_minimum_required(VERSION 3.14)
project(CompressionSystem)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
# Threads
find_package(Threads REQUIRED)
# Include root src directory
include_directories(src)

# ----- GoogleTest -----
include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)
file(GLOB_RECURSE SRC_FILES "src/*.cpp")
list(FILTER SRC_FILES EXCLUDE REGEX "src/main.cpp$")
list(FILTER SRC_FILES EXCLUDE REGEX "src/CppClient.cpp$")
add_library(core_lib ${SRC_FILES})
target_link_libraries(core_lib PUBLIC Threads::Threads)

# ----- ServerMain executable -----
add_executable(ServerMain src/main.cpp)
target_link_libraries(ServerMain PRIVATE core_lib Threads::Threads)

# C++ client executable
add_executable(CppClient src/CppClient.cpp)
target_link_libraries(CppClient PRIVATE Threads::Threads)

# ----- Tests -----
enable_testing()
file(GLOB_RECURSE TEST_FILES "TESTS/*.cpp")
list(FILTER TEST_FILES EXCLUDE REGEX "TESTS/TestTcpServer.cpp$")
add_executable(RunTests ${TEST_FILES})
target_link_libraries(RunTests
    PRIVATE
        core_lib
        gtest
        Threads::Threads
)
add_test(NAME AllTests COMMAND RunTests)