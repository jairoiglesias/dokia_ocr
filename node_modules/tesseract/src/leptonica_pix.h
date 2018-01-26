/*
 * Copyright by Alexander Makarenko
 *
 * See license text in LICENSE file
 */

#ifndef LEPTONICA_PIX_H_
#define LEPTONICA_PIX_H_

#include <allheaders.h>
#include <node.h>

#define REQUIRE_PATH                                            \
   if (args.Length() < 1 || !args[0]->IsString()) {             \
      return ThrowException(Exception::Error(String::New(       \
      "Image path should be first and the only argument.")));   \
   }                                                            \

using namespace v8;

class PixWrap : public node::ObjectWrap {
  public:
    static void Initialize(Handle<Object> target);
    PIX* data();

  private:
    PixWrap(PIX* data, char* imagePath);
    ~PixWrap();

    void FreeAll();
    static PIX* PixRead(const Arguments& args);
    static Handle<Value> New(const Arguments& args);
    static Handle<Value> GetPath(const Arguments& args);
    static Handle<Value> Reload(const Arguments& args);

    char* path;
    PIX* pix;
};

#endif