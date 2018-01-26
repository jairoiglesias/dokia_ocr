/*
 * Copyright by Alexander Makarenko
 *
 * See license text in LICENSE file
 */

#define BUILDING_NODE_EXTENSION
#include <string.h>
#include <node.h>
#include "leptonica_pix.h"

using namespace v8;


void PixWrap::Initialize(Handle<Object> target) {
  // Prepare constructor template
  Local<FunctionTemplate> t = FunctionTemplate::New(New);
  t->SetClassName(String::NewSymbol("Pix"));
  t->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  t->PrototypeTemplate()->Set(
      String::NewSymbol("getPath"),
      FunctionTemplate::New(GetPath)->GetFunction());

  t->PrototypeTemplate()->Set(
      String::NewSymbol("reload"),
      FunctionTemplate::New(Reload)->GetFunction());

  Persistent<Function> constructor = Persistent<Function>::New(t->GetFunction());
  target->Set(String::NewSymbol("Pix"), constructor);
}


PIX* PixWrap::PixRead(const Arguments& args) {
  String::Utf8Value path(args[0]);
  return pixRead((const char *) (*path));
}


PixWrap::PixWrap(PIX* data, char* imagePath) {
  this->path = imagePath;
  this->pix = data;
};


PixWrap::~PixWrap() {
  if (path != NULL) {
    FreeAll();
  }
};


PIX* PixWrap::data() {
  return pix;
}


void PixWrap::FreeAll() {
  delete pix;
  delete[] path;
}


Handle<Value> PixWrap::New(const Arguments& args) {
  HandleScope scope;
  REQUIRE_PATH;

  PIX* pix = PixRead(args);
  if (pix == NULL) {
    return ThrowException(Exception::Error(String::New("Image was not found or has unsupported format.")));
  }

  String::Utf8Value path(args[0]);
  PixWrap* obj = new PixWrap(pix, strdup(*path));
  obj->Wrap(args.This());

  return args.This();
}


Handle<Value> PixWrap::GetPath(const Arguments& args) {
  HandleScope scope;

  PixWrap* obj = ObjectWrap::Unwrap<PixWrap>(args.This());
  return scope.Close(String::New(obj->path));
}


Handle<Value> PixWrap::Reload(const Arguments& args) {
  HandleScope scope;
  REQUIRE_PATH;

  PIX* pix = PixRead(args);
  if (pix == NULL) {
    return ThrowException(Exception::Error(String::New("Image was not found or has unsupported format.")));
  }

  PixWrap* obj = ObjectWrap::Unwrap<PixWrap>(args.This());
  obj->FreeAll();

  String::Utf8Value path(args[0]);
  obj->pix = pix;
  obj->path = strdup(*path);

  return scope.Close(Null());
}
