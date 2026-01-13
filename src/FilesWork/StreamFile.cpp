#include "StreamFile.h"
#include <fstream>
#include <vector>

StreamFile::StreamFile(const string &fileName):name(fileName) {
}

const string& StreamFile::get_name() const {
    return name;
}

string StreamFile::read_all() const {
    // Open with ios binary to handle all characters (including \n inside data) safely
    ifstream file(name, ios::binary | ios::ate);
    if(!file.is_open()) {
        return "";
    }
    file.seekg(0, ios::end);
    streamsize size = file.tellg();
    file.seekg(0, ios::beg);
    if (size <= 0) {
        return "";
    }
    // Create a string of the correct size
    string result;
    result.resize(static_cast<size_t>(size));
    // Read the data directly into the string buffer
    file.read(&result[0], size);
    return result;
}

void StreamFile::write_all(const string& newData) {
    ofstream file(name, ios::binary | ios::out | ios::trunc);
    // Open as binary to prevent any translation of characters
    if (!file.is_open()) {
        return;
    }
    // Write new data to the file
    file.write(newData.data(), static_cast<streamsize>(newData.size()));
}