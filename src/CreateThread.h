#ifndef CREATE_THREAD_H
#define CREATE_THREAD_H
#include "Interfaces/IThreadRun.h"
#include <functional>
#include <thread>

using namespace std;

class CreateThread : public  IThreadRun {
public:
     void run(function<void()>func);
};
#endif