#ifndef ISTORAGE_H
#define ISTORAGE_H

#include <vector>
#include <string>

using namespace std;

class IStorage {
public:
virtual ~IStorage() = default;
//for ADD function
virtual void saveFile(const string &name, const string &text) = 0;
//for GET function
virtual string loadFile(const string &name) = 0;
//for SEARCH function
virtual vector<string> searchFile(const string &searchText) = 0;
//for DELETE function
virtual bool deleteFile(const string& name) = 0;
};
#endif