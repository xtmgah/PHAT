"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getAppPath_1 = require("./req/getAppPath");
const bootStrapCodeCache_1 = require("./req/bootStrapCodeCache");
bootStrapCodeCache_1.bootStrapCodeCache(getAppPath_1.getReadable("QCRenderer.js"), "./QCRenderer", getAppPath_1.getReadableAndWritable("QCRenderer.cdata"));
