#include "FileStorage.h"
#include <filesystem>

using namespace std;
using namespace std::filesystem;

FileStorage::FileStorage(const string& basePath_, ICompressor& compressor_): compressor(compressor_), basePath(basePath_){
}
//create a lowercase copy of a string
static string toLowerCopy(const string& s) {
    string result;
    result.reserve(s.size());
    for (char ch : s) {
        // cast to unsigned char to avoid UB on negative chars
        unsigned char uch = static_cast<unsigned char>(ch);
        result.push_back(static_cast<char>(tolower(uch)));
    }
    return result;
}
void FileStorage::saveFile(const string& name, const std::string& text){
    unique_lock<shared_mutex> lock(rwLock);
    if (name.empty()) 
        return;
    //full path where file will be stored
    string fullPath = basePath + "/" + name;
    //if file already exists, do nothing
    if (exists(fullPath)) {
        return;
    }
    //compress the content before saving
    string compressedText = compressor.compress(text);
    //if we here then file doesn't exist, create new one
    StreamFile file(fullPath);
    //write the content inside
    file.write_all(compressedText);
}
bool FileStorage::deleteFile(const string& name) {
    unique_lock<shared_mutex> lock(rwLock);
    //if name is empty, return false
    if (name.empty()) {
        return false;
    }
    //full path where file will be stored
    string fullPath = basePath + "/" + name;
    //try to delete the file, return true if successful
    try {
        //check if file exists
        if (!exists(fullPath)) {
            return false;
        }
        //remove the file
        return remove(fullPath);
    } catch (const filesystem_error&) {
        //if any error occurs, return false
        return false;
    }
}
string FileStorage::loadFile(const string& name){
    shared_lock<shared_mutex> lock(rwLock);
    if (name.empty())
        return "";
    //full path where file will be stored
    string fullPath = basePath + "/" + name;
    //search for file by name
    StreamFile file(fullPath);
    //read the content
    string compressedText = file.read_all();
    //if file is empty, return empty string
    if (compressedText.empty()) {
        return "";
    }
    //decompress and return it
    return compressor.decompress(compressedText);
}
vector<string> FileStorage::searchFile(const string& searchText) {
    shared_lock<shared_mutex> lock(rwLock);
    vector<string> result;
    //if search text is empty, return empty list
    if (searchText.empty()) {
        return result;
    }
    //convert the search text to lowercase once
    string needleLower = toLowerCopy(searchText);
    try {
        //iterate over all entries in the storage folder
        for (const auto& entry : directory_iterator(basePath)) {
            //only regular files and not directories or others
            if (!entry.is_regular_file()) {
                continue;
            }
            //build full path and file name
            string fullPath = entry.path().string();
            string fileName = entry.path().filename().string();
            //lowercase file name
            string fileNameLower = toLowerCopy(fileName);
            //case-insensitive search in file name
            if (fileNameLower.find(needleLower) != string::npos) {
                result.push_back(fileName);
                continue;
            }
            //read compressed content from this file
            StreamFile file(fullPath);
            string compressed = file.read_all();
            //if file is empty, skip it
            if (compressed.empty()) {
                continue;
            }
            //decompress so we can search in clear text
            string content = compressor.decompress(compressed);
            //lowercase content for case-insensitive search
            string contentLower = toLowerCopy(content);
            //case-insensitive search in content
            if (contentLower.find(needleLower) != string::npos) {
                result.push_back(fileName);
            }
        }
    } catch (const filesystem_error&) {
        //if basePath doesn't exist or can't be read, just return empty result
    }
    return result;
}