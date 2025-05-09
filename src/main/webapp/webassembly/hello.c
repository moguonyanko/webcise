#include <stdio.h>

/* Compile command */
/* emcc hello.c -s WASM=1 -o wasmoutput/hello.html */

int main(int argc, char ** argv) 
{
    printf("こんにちは、WebAssembly!\n");
    return 0;
}
