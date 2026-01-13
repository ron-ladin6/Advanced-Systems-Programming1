#ifndef ICOMPRESSOR_H
#define ICOMPRESSOR_H
#include <string>

//create interface for compressor. 
//all compressors will inherit from this interface.
//it will have two pure virtual functions: compress and decompress.
class ICompressor
{
    public:
   
    virtual ~ICompressor() = default;
    // in this two functions prefer "pass by reference" over "pass by value" to avoid copying the string.
    //in compress function, input is the original data, output is the compressed data.
    virtual std::string compress(const std::string& data) = 0;
    //in decompress function, input is the compressed data, output is the original data.
    virtual std::string decompress(const std::string& data) = 0;
};
#endif


