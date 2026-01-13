#ifndef IMENU_H
#define IMENU_H
#include <string>
using namespace std;
class IMenu {
public:
virtual ~IMenu() = default;
virtual string get_next_command_line() = 0;
virtual void display_command_output(const string& output) = 0;
};

#endif