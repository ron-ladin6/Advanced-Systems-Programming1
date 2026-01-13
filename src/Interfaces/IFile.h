#ifndef IFILE_H
#define IFILE_H

#include <string>

using namespace std;

struct IFile {
    virtual ~IFile() = default;
    virtual const string& get_name() const = 0;
    virtual string read_all() const = 0;
    virtual void write_all(const string& newData) = 0;
};

#endif