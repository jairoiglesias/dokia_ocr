/*
 * Copyright by Alexander Makarenko
 *
 * See license text in LICENSE file
 */

#ifndef TESSERACT_BASEAPI_H_
#define TESSERACT_BASEAPI_H_

#include <baseapi.h>
#include <allheaders.h>
#include <node.h>
#include "tesseract_bindings.h"

using namespace v8;

class BaseApi : public node::ObjectWrap {
  public:
    static void Initialize(Handle<Object> target);

  private:
    BaseApi();
    ~BaseApi();

    static Handle<Value> New(const Arguments& args);
    static Handle<Value> Init(const Arguments& args);
    static Handle<Value> SetImage(const Arguments& args);
    static Handle<Value> Recognize(const Arguments& args);
    static Handle<Value> GetText(const Arguments& args);
    static Handle<Value> GetBoxes(const Arguments& args);
    static Handle<Value> SetRectangle(const Arguments& args);
    static Handle<Value> MeanTextConf(const Arguments& args);
    static Handle<Value> SetVariable(const Arguments& args);
    static Handle<Value> WhitelistCharacters(const Arguments& args);
    static Handle<Value> SetPageSegMode(const Arguments& args);
    static Handle<Value> Clear(const Arguments& args);
    static Handle<Value> End(const Arguments& args);

    tesseract::TessBaseAPI* ocr;
    void Clear();
    void End();
};

#endif