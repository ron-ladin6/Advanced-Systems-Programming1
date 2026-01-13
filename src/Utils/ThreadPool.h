#ifndef THREADPOOL_H
#define THREADPOOL_H

#include <cstddef>
#include <condition_variable>
#include <functional>
#include <mutex>
#include <queue>
#include <thread>
#include <vector>
#include <utility>

#include "Interfaces/IThreadRun.h"

using namespace std;

class ThreadPool : public IThreadRun {
private:
    vector<thread> workers;
    queue<function<void()>> tasks;
    mutex mtx;
    condition_variable cv;
    bool stopping;
    void workerLoop();

public:
    //create pool
    explicit ThreadPool(size_t threadCount);
    //add task
    void addTask(function<void()> task);
    //stop pool
    void stop();
    void run(function<void()> func) override;
    ~ThreadPool();
};

#endif