#ifndef RLECOMPRESSOR_H
#define RLECOMPRESSOR_H

#include "../Interfaces/ICompressor.h"
#include <string>

using namespace std;

class RLECompressor : public ICompressor
{
private:
  void chaining_str(string& original , int count , char compress);
  void decompress_one_sequence(string& original, int count , char decompress);
public:
    RLECompressor();
    ~RLECompressor();
    string compress(const string& data);
    string decompress(const string& data);
};
#endif

    
