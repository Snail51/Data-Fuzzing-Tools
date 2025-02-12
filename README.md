# Purpose
 - This program provides a series of webapps to aid in exploring data corruption/fuzzing for creative purposes.
 - It was originally created by Brendan Rood during the Spring of 2024 for the Advanced Computer Security course (CS-5732) at the University of Minnesota Duluth. In that version, only `heatmapAnalyzer.html` was available. Actual fuzzing was done with [zzuf](http://caca.zoy.org/wiki/zzuf).
 - The tools that actually do the fuzzing/byte modification (`autoFuzzer.html`, `byteEditor.html`) were written by Brendan Rood on or about 2024-12-07.

# Installation / Usage
 - Can be run in any httpx environment with JavaScript execution.
 - **Already available at: https://tools.snailien.net/fuzzatron/**

# What is "Fuzzing"?
 Fuzzing is a concept in computer science to check data integrity and edge case handling.
 The idea is, **it is preferable for a program to recognize corrupted input and refuse to process it, rather than process corrupted input as though it were valid**. Corrupted input may produce unintended/undefined behavior, which poses a risk!

 The classic example is `.bmp` images. If you take a few bytes in one of these files and randomize their values, there is still a decent chance that the image will be technically viewable, but with a very distorted appearance.

 Fuzzing is most useful when files have a discrete "header" and "data" section. Randomizing a byte in the data section of a `.bmp` will only have and effect on that one pixel. Randomizing a byte in the header may resize the image, change the bit depth, or even erroneously apply compression; all of these have an effect on the entire image rather than a single pixel. Thus, fuzzing the Header is preferable when attempting to create interesting images with fuzzing.

<hr>

# The Heatmap Analyzer
 The heatmap analyzer (`heatmapAnalyzer.html`) is a webapp for comparing an "original" file against a series of "mutants". By performing this comparison, it can be determined which bytes are causing certain behavior in the output.
 The user provides 1 original file, N mutants, and a header size (integer).
 ### Examples
  - If the output contains 20 images that exhibit similar behavior, comparing those images against the original might reveal that each mutant had a change to the byte and index 11 and 12. In the future, you could fuzz only those two bytes to generate mutants that exhibit that behavior.
  - If you compare only "drawable" images against the original, If you notice that valid images never change the byte at index 8, that might indicate that changing the byte at index 8 is a sensitive byte and you can exclude it from future fuzzing attempts.

<hr>

# The Auto Fuzzer
 The auto fuzzer (`autoFuzzer.html`) is a webapp used to actually preform the fuzzing operation, replacing the function of [zzuf](http://caca.zoy.org/wiki/zzuf).
 The user provides an original file, a range of bytes to fuzz, and a per-byte mutation chance.
 ### Execution Type
  If the provided file is an image, and you want to automatically keep re-generating until a "valid" image is produced, you can click "Fuzz Image".
  If you are fuzzing a non-image, or want to allow "invalid" images, you can click "Fuzz File".
 ### Fuzzing Ranges
  When providing a range of bytes to fuzz, a semicolon-deliminated list is to be provided with dashes used for regions. For example, `0-10;14;20-22` specifies bytes 0 to 10 (inclusive), byte 14, and bytes 20 to 22 (inclusive).
  When first fuzzing a file, it is recommended to fuzz bytes 2-255. Most files have a header no larger than 256 bytes, and the first two bytes are reserved for the filetype.

<hr>

# The Byte Editor
 The byte editor (`byteEditor.html`) is a webapp used to easily modify a single byte of many files. The user provides N files, a byte index, and a replacement value. All provided files have that byte changed to the replacement value. The results are then returned to the user in a zip file.

 This program is useful to preform targeted modifications to files based on the findings of previous fuzzing. If, for example, you learn that changing `byte 18` of a `.bmp` to value `31` produces the effect you are looking for, you could provide 20 `.bmp` files and quickly change the `byte 18` to `31` in each input. 