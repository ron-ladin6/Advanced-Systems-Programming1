#include <gtest/gtest.h>
#include "../src/compression/RLECompressor.h"

using namespace std;

const int MAX_COUNT = 127; // must match RLECompressor

// ------------------ COMPRESSION TESTS ------------------

// empty string should compress to empty string
TEST(RLECompressorTest, EmptyString) {
    RLECompressor compressor;
    EXPECT_EQ(compressor.compress(""), "");
}

// single character
TEST(RLECompressorTest, SingleCharacter) {
    RLECompressor compressor;
    string result = compressor.compress("A");
    EXPECT_EQ(result, string({1,'A'}));
}

// simple sequence compression
TEST(RLECompressorTest, SimpleSequence) {
    RLECompressor compressor;
    string result = compressor.compress("AAABB");
    EXPECT_EQ(result, string({3,'A',2,'B'}));
}

// multiple sequences
TEST(RLECompressorTest, MultipleSequences) {
    RLECompressor compressor;
    string result = compressor.compress("AABCCCCD");
    EXPECT_EQ(result, string({2,'A',1,'B',4,'C',1,'D'}));
}

// long sequence over MAX_COUNT
TEST(RLECompressorTest, LongSequenceOverMaxCount) {
    RLECompressor compressor;
    string longA(MAX_COUNT + 10, 'A'); // 137 'A's
    string compressed = compressor.compress(longA);
    string decompressed = compressor.decompress(compressed);
    EXPECT_EQ(decompressed, longA);
}

// ------------------ DECOMPRESSION TESTS ------------------

// round-trip compress->decompress
TEST(RLECompressorTest, CompressDecompressRoundTrip) {
    RLECompressor compressor;
    string data = "AAAABBBCCCCDDDDE";
    string compressed = compressor.compress(data);
    string decompressed = compressor.decompress(compressed);
    EXPECT_EQ(decompressed, data);
}

// decompress empty string
TEST(RLECompressorTest, DecompressEmptyString) {
    RLECompressor compressor;
    EXPECT_EQ(compressor.decompress(""), "");
}

// decompress single pair
TEST(RLECompressorTest, DecompressSinglePair) {
    RLECompressor compressor;
    string compressed = string({3,'A'});
    EXPECT_EQ(compressor.decompress(compressed), "AAA");
}

// decompress multiple pairs
TEST(RLECompressorTest, DecompressMultiplePairs) {
    RLECompressor compressor;
    string compressed = string({3,'A',2,'B',1,'C'});
    EXPECT_EQ(compressor.decompress(compressed), "AAABBC");
}

// decompress long sequence over MAX_COUNT
TEST(RLECompressorTest, DecompressLongSequenceOverMaxCount) {
    RLECompressor compressor;
    string data(MAX_COUNT + 5, 'Z'); // 132 'Z's
    string compressed = compressor.compress(data);
    string decompressed = compressor.decompress(compressed);
    EXPECT_EQ(decompressed, data);
}
