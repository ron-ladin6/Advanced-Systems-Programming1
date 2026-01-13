#ifndef FILESTORAGE_H
#define FILESTORAGE_H

#include "../Interfaces/IStorage.h"
#include "../Interfaces/ICompressor.h"
#include "StreamFile.h"
#include <cctype>
#include <shared_mutex>
#include <mutex>
#include <string>
#include <vector>

using namespace std;

class FileStorage : public IStorage {
public:
    FileStorage(const string& basePath, ICompressor& compressor);
    //add file given a name and a text
    void saveFile(const string &name, const string &text) override;
    //search file given a name and return it content
    string loadFile(const string &name) override;
    //look for "searchtext" inside every file
    vector<string> searchFile(const string &searchText) override;
    //delete file given a name
    bool deleteFile(const string& name) override;
    
    private:
    //object to RLEcompressor
    ICompressor& compressor;
    //path where the files will be stored
    string basePath;
    //read-write lock for thread safety
    mutable shared_mutex rwLock;

};
#endif