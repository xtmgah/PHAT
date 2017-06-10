"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const events_1 = require("events");
const uuidv4 = require("uuid/v4");
class Contig {
    constructor() {
        this.bp = 0;
        this.name = "";
        this.alias = "";
        this.loaded = false;
        this.uuid = uuidv4();
    }
}
exports.Contig = Contig;
class FastaContigLoader extends events_1.EventEmitter {
    constructor() {
        super();
        this.refStream;
        this.contigs = new Array();
        this.contigIndex = -1;
    }
    beginRefStream(path) {
        this.refStream = fs.createReadStream(path, { encoding: "UTF8" });
        let self = this;
        this.refStream.on("data", function (data) {
            for (let i = 0; i != data.length; ++i) {
                if (data[i] == ">") {
                    self.contigs.push(new Contig());
                    ++self.contigIndex;
                    ++i;
                    while (data[i] != "\n") {
                        self.contigs[self.contigIndex].name += data[i];
                        self.contigs[self.contigIndex].alias += data[i];
                        ++i;
                    }
                    if (self.contigIndex - 1 >= 0) {
                        self.contigs[self.contigIndex - 1].loaded = true;
                        self.emit("loadedContig", self.contigs[self.contigIndex - 1]);
                    }
                    continue;
                }
                else if (data[i] == "a" ||
                    data[i] == "A" ||
                    data[i] == "t" ||
                    data[i] == "T" ||
                    data[i] == "c" ||
                    data[i] == "C" ||
                    data[i] == "g" ||
                    data[i] == "G")
                    self.contigs[self.contigIndex].bp += 1;
            }
        });
        this.refStream.on("end", function () {
            self.contigs[self.contigIndex].loaded = true;
            self.emit("loadedContig", self.contigs[self.contigIndex]);
            self.emit("doneLoadingContigs");
            self.refStream = null;
        });
    }
}
exports.FastaContigLoader = FastaContigLoader;
