#include "CreateThread.h"

using namespace std;

 void CreateThread :: run (function<void()>func) {
    thread t(func);
    t.detach();
 }