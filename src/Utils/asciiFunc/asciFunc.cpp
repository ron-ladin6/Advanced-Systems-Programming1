#include "asciFunc.h"
#include <string>

using namespace std;

//chack if char is digits according ascii table.
bool is_digit_in_asci(char c) {
    if (c - '0' >= 0 && c - '0' <= 9) {
        return true;
    }
    return false;
}

//convert str to int according ascii.
int string_to_int(string s) {
    int result = 0;
    for (int i = 0; i < s.size(); i++) {
        result = result * 10 + s[i] - '0';
    }
    return result;
}