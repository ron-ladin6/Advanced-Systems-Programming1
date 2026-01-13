#include "RLECompressor.h"
#include <string>

using namespace std;

const int MAX_COUNT = 127; //max number  that we can store in one byte (and char is 1 byte). 


//Default constructor for RLECompressor.
RLECompressor::RLECompressor(){}
//Default destructor for RLECompressor.
RLECompressor::~RLECompressor() {}
//take str and add to two char,the first represent the conunt and the second the char.
 void RLECompressor::chaining_str(string& original , int count , char compress){
    original += static_cast<char>(count); 
    original += compress;
 }
 
 
  //for one sequence (like 5A) make a loop to take digits and char and make theme to str that include this char "digit time".
  void RLECompressor:: decompress_one_sequence(std::string& original, int count , char decompress){
     while (count>0){
        original += decompress;
        count--;
     }
  }
 /**
 * @brief Compresses a string using the RLE algorithm.
 * @param data The original string ("AAABBC").
 * @return The compressed string ("3A2B1C").
 */
 string RLECompressor::compress(const string& data){
     int size = data.length();
     //edge case if the str is empty.
     if (size == 0){
        return "";
     }
     string compressed;
     if (size == 1) {
       chaining_str(compressed, 1, data[0]);
       return compressed;
    }
     
     int count = 1;
     //every time that the current char equal to his prev, so we add for 1 the count we can compress this sequence
        for (int i = 1; i < size; i++) {
            if (data[i] == data[i - 1]) {
                count++;
            }
            else {
                //if we reach the max count we can store in one byte, we need to store it and start a new count.
                while (count > MAX_COUNT) {
                    chaining_str(compressed, MAX_COUNT, data[i - 1]);
                    count -= MAX_COUNT;
                }
                //store the rest count and the char.
                chaining_str(compressed, count, data[i - 1]);
                count = 1; //reset count for new char.
            } 
        }
        //handle the last sequence.
        while (count > MAX_COUNT) {
            chaining_str(compressed, MAX_COUNT, data[size - 1]);
            count -= MAX_COUNT;
        }
        chaining_str(compressed, count, data[size - 1]);
        return compressed;
    }
/**
 * @brief Decompresses a string using the RLE algorithm.
 * @param data The compressed string ("3A2B1C").
 * @return The original string ("AAABBC").
*/
string RLECompressor::decompress(const string& data){
    int size = data.length();
    //edge case if the str is empty.
    if (size == 0){
        return "";
    }
    string decompressed;
    for (int i = 0; i < size; i += 2) {
        //get the count from the char.
        int count = static_cast<unsigned char>(data[i]); 
        char decompress = data[i + 1];
        //decompress one sequence and add it to the original str.
        decompress_one_sequence(decompressed, count, decompress);
    }
    return decompressed;
}
   
