/*
 * Copyright by Alexander Makarenko
 *
 * See license text in LICENSE file
 */

#define BUILDING_NODE_EXTENSION
#include <node.h>
#include <node_buffer.h>
#include "tesseract_baseapi.h"
#include "leptonica_pix.h"

using namespace v8;


BaseApi::BaseApi() {
  ocr = new tesseract::TessBaseAPI();
};


BaseApi::~BaseApi() {
  ocr->Clear();
  ocr->End();
};


void BaseApi::Initialize(Handle<Object> target) {
  // Prepare constructor template
  Local<FunctionTemplate> t = FunctionTemplate::New(New);
  t->SetClassName(String::NewSymbol("BaseApi"));
  t->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  t->PrototypeTemplate()->Set(
    String::NewSymbol("clear"),
    FunctionTemplate::New(Clear)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("end"),
    FunctionTemplate::New(End)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("init"),
    FunctionTemplate::New(Init)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("setImage"),
    FunctionTemplate::New(SetImage)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("recognize"),
    FunctionTemplate::New(Recognize)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("getText"),
    FunctionTemplate::New(GetText)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("getBoxes"),
    FunctionTemplate::New(GetBoxes)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("setRectangle"),
    FunctionTemplate::New(SetRectangle)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("meanTextConf"),
    FunctionTemplate::New(MeanTextConf)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("setVariable"),
    FunctionTemplate::New(SetVariable)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("whitelistCharacters"),
    FunctionTemplate::New(WhitelistCharacters)->GetFunction());

  t->PrototypeTemplate()->Set(
    String::NewSymbol("setPageSegMode"),
    FunctionTemplate::New(SetPageSegMode)->GetFunction());

  Persistent<Function> constructor = Persistent<Function>::New(t->GetFunction());
  target->Set(String::NewSymbol("BaseApi"), constructor);
}


Handle<Value> BaseApi::New(const Arguments& args) {
  HandleScope scope;

  BaseApi* obj = new BaseApi();
  obj->Wrap(args.This());

  return args.This();
}


Handle<Value> BaseApi::Init(const Arguments& args) {
  HandleScope scope;
  REQUIRE_STRING(arg_lang, 0);

  char *lang;
  if (arg_lang.length()) {
    lang = strdup(*arg_lang);
  } else {
    lang = (char *) "eng";
  }

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  int ret = obj->ocr->Init(NULL, lang);
  return scope.Close(Integer::New(ret));
}


Handle<Value> BaseApi::SetImage(const Arguments& args) {
  HandleScope scope;
  REQUIRE_ARG_NUM(1);

  PIX* pix;
  if (args[0]->IsString()) {
    pix = pixRead(strdup(*(String::Utf8Value(args[0]))));
  } else if (node::Buffer::HasInstance(args[0])) {
    char* buff = node::Buffer::Data(args[0]);
    size_t size = node::Buffer::Length(args[0]);
    pix = pixReadMem((l_uint8*)buff, size);
  } else {
    PixWrap* pixWrap = ObjectWrap::Unwrap<PixWrap>(args[0]->ToObject());
    pix = pixWrap->data();
  }

  if (pix == NULL) {
    return ThrowException(Exception::Error(
    String::New("Image was not found or has unsupported format.")));
  }

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  obj->ocr->SetImage(pix);
  return scope.Close(Null());
}


Handle<Value> BaseApi::Recognize(const Arguments& args) {
  HandleScope scope;

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  obj->ocr->Recognize(NULL);
  return scope.Close(Null());
}


Handle<Value> BaseApi::GetText(const Arguments& args) {
  HandleScope scope;

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  char *text = obj->ocr->GetUTF8Text();
  return scope.Close(String::New(text));
}

Handle<Value> BaseApi::SetVariable(const Arguments& args){
  HandleScope scope;
  REQUIRE_ARG_NUM(2);

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  obj->ocr->SetVariable(strdup(*(String::Utf8Value(args[0]))), strdup(*(String::Utf8Value(args[1]))));

  return scope.Close(Null());
}

Handle<Value> BaseApi::WhitelistCharacters(const Arguments& args){
  HandleScope scope;
  REQUIRE_ARG_NUM(1);

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  obj->ocr->SetVariable("tessedit_char_whitelist", strdup(*(String::Utf8Value(args[0]))));

  return scope.Close(Null());
}

Handle<Value> BaseApi::Clear(const Arguments& args) {
  HandleScope scope;

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  obj->ocr->Clear();
  return scope.Close(Null());
}

Handle<Value> BaseApi::MeanTextConf(const Arguments& args) {
  HandleScope scope;

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  Local<Number> conf = Number::New(obj->ocr->MeanTextConf());
  return scope.Close(conf);
}

/*

From tesseract/include/publictypes.h

PSM_OSD_ONLY,       ///< Orientation and script detection only.
PSM_AUTO_OSD,       ///< Automatic page segmentation with orientation and
                    ///< script detection. (OSD)
PSM_AUTO_ONLY,      ///< Automatic page segmentation, but no OSD, or OCR.
PSM_AUTO,           ///< Fully automatic page segmentation, but no OSD.
PSM_SINGLE_COLUMN,  ///< Assume a single column of text of variable sizes.
PSM_SINGLE_BLOCK_VERT_TEXT,  ///< Assume a single uniform block of vertically
                             ///< aligned text.
PSM_SINGLE_BLOCK,   ///< Assume a single uniform block of text. (Default.)
PSM_SINGLE_LINE,    ///< Treat the image as a single text line.
PSM_SINGLE_WORD,    ///< Treat the image as a single word.
PSM_CIRCLE_WORD,    ///< Treat the image as a single word in a circle.
PSM_SINGLE_CHAR,    ///< Treat the image as a single character.

*/
Handle<Value> BaseApi::SetPageSegMode(const Arguments& args){
  HandleScope scope;
  REQUIRE_ARG_NUM(1);

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  char* mode = strdup(*(String::Utf8Value(args[0])));

  if(strcmp(mode, "PSM_OSD_ONLY") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_OSD_ONLY);
  }else if(strcmp(mode, "PSM_AUTO_OSD") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_AUTO_OSD);
  }else if(strcmp(mode, "PSM_AUTO_ONLY") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_AUTO_ONLY);
  }else if(strcmp(mode, "PSM_AUTO") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_AUTO);
  }else if(strcmp(mode, "PSM_SINGLE_COLUMN") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_SINGLE_COLUMN);
  }else if(strcmp(mode, "PSM_SINGLE_BLOCK_VERT_TEXT") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_SINGLE_BLOCK_VERT_TEXT);
  }else if(strcmp(mode, "PSM_SINGLE_BLOCK") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_SINGLE_BLOCK);
  }else if(strcmp(mode, "PSM_SINGLE_LINE") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_SINGLE_LINE);
  }else if(strcmp(mode, "PSM_SINGLE_WORD") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_SINGLE_WORD);
  }else if(strcmp(mode, "PSM_CIRCLE_WORD") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_CIRCLE_WORD);
  }else if(strcmp(mode, "PSM_SINGLE_CHAR") == 0){
    obj->ocr->SetPageSegMode(tesseract::PSM_SINGLE_CHAR);
  }

  return scope.Close(Null());
}

/*
From tesseract/include/publictypes.h

RIL_BLOCK,     // Block of text/image/separator line.
RIL_PARA,      // Paragraph within a block.
RIL_TEXTLINE,  // Line within a paragraph.
RIL_WORD,      // Word within a textline.
RIL_SYMBOL     // Symbol/character within a word.
*/
Handle<Value> BaseApi::GetBoxes(const Arguments& args) {
  HandleScope scope;
  unsigned int i;
  tesseract::PageIteratorLevel level = tesseract::RIL_TEXTLINE;

  if(args.Length() > 0){
    char* flag = strdup(*(String::Utf8Value(args[0])));
    if(strcmp(flag, "RIL_BLOCK") == 0){
      level = tesseract::RIL_BLOCK;
    }else if(strcmp(flag, "RIL_PARA") == 0){
      level = tesseract::RIL_PARA;
    }else if(strcmp(flag, "RIL_TEXTLINE") == 0){
      level = tesseract::RIL_TEXTLINE;
    }else if(strcmp(flag, "RIL_WORD") == 0){
      level = tesseract::RIL_WORD;
    }else if(strcmp(flag, "RIL_SYMBOL") == 0){
      level = tesseract::RIL_SYMBOL;
    }
  }

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  Boxa* boxes = obj->ocr->GetComponentImages(level, true, NULL, NULL);

  Local<Array> out = Array::New(boxes->n);
  for (i = 0; i < boxes->n; i++) {
    Local<Object> curr = Object::New();

    BOX* box = boxaGetBox(boxes, i, L_CLONE);
    curr->Set(String::New("x"), Number::New(box->x));
    curr->Set(String::New("y"), Number::New(box->y));
    curr->Set(String::New("w"), Number::New(box->w));
    curr->Set(String::New("h"), Number::New(box->h));
    out->Set(i, curr);
  }

  return scope.Close(out);
}


Handle<Value> BaseApi::SetRectangle(const Arguments& args) {
  HandleScope scope;
  REQUIRE_ARG_NUM(4);
  unsigned int i;

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  for(i = 0; i < 4; i++){
    if(!args[i]->IsNumber()){
      return ThrowException(Exception::Error(
      String::New("SetRectangle requires four integer arguments")));
    }
  }

  obj->ocr->SetRectangle(args[0]->Uint32Value(), args[1]->Uint32Value(), args[2]->Uint32Value(), args[3]->Uint32Value());
  return scope.Close(Null());
}


Handle<Value> BaseApi::End(const Arguments& args) {
  HandleScope scope;

  BaseApi* obj = ObjectWrap::Unwrap<BaseApi>(args.This());
  obj->ocr->End();
  return scope.Close(Null());
}
