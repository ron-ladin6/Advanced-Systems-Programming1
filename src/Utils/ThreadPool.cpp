#include "Utils/ThreadPool.h"

using namespace std;

ThreadPool::ThreadPool(size_t threadCount) : stopping(false) {
    for (size_t i = 0; i < threadCount; ++i) {
        workers.emplace_back([this]() {
            workerLoop(); 
        });
    }
}

void ThreadPool::addTask(function<void()> task) {
    {
        lock_guard<mutex> lock(mtx);
        //if stop() was called, ignore new tasks
        if (stopping) {
            return;
        }
        tasks.push(move(task));
    }
    //notify one worker thread
    cv.notify_one();
}

void ThreadPool::run(std::function<void()> func) {
    addTask(move(func));
}

void ThreadPool::stop() {
    {
        lock_guard<mutex> lock(mtx);
        //if already stopped
        if (stopping) {
            return;
        }
        stopping = true;
    }
    //notify all workers to exit
    cv.notify_all();
    //join threads
    for (thread& t : workers) {
        if (t.joinable()) {
            t.join();
        }
    }
}
//destructor
ThreadPool::~ThreadPool() {
    stop();
}

void ThreadPool::workerLoop() {
    while (true) {
        function<void()> task;
        {
            unique_lock<mutex> lock(mtx);
            // wait until there is a task, or stop is requested
            cv.wait(lock, [this]() {
                return stopping || !tasks.empty();
            });
            // if stopping and no tasks left, exit thread
            if (stopping && tasks.empty()) {
                return;
            }
            //get the next task
            task = move(tasks.front());
            tasks.pop();
        }
        //execute task outside the lock
        task();
    }
}