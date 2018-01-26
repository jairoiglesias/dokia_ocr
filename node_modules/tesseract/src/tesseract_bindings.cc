/*
 * Copyright by Alexander Makarenko
 *
 * See license text in LICENSE file
 */

#define BUILDING_NODE_EXTENSION
#include <node.h>
#include "tesseract_baseapi.h"
#include "leptonica_pix.h"

using namespace v8;

void InitTesseract(Handle<Object> target) {
  BaseApi::Initialize(target);
  PixWrap::Initialize(target);
}

NODE_MODULE(tesseract_bindings, InitTesseract)