#ifndef STREAMFILE_H
#define STREAMFILE_H
#include "../Interfaces/IFile.h"
#include <string>

using namespace std;

struct StreamFile : IFile {
    //constructor with default
    explicit StreamFile(const string& name = "");
    //return file name
    const string& get_name() const override;
    //return what inside the file(as one string)
    string read_all() const override;
    //rewrite what inside the file with new data
    void write_all(const string& newData) override;

private:
    //file name
    string name;
};

#endif