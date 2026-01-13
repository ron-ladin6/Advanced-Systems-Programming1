#ifndef ITHREADRUN_H
#define ITHREADRUN_H
#include <functional>
using namespace std;
class IThreadRun {
public:

    virtual ~IThreadRun() = default;
    virtual void run(function<void()>func) = 0;
};
#endif 
