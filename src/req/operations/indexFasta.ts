import * as fs from "fs";

const fse = require("fs-extra");

import * as atomic from "./atomicOperations";
import {Fasta} from "./../fasta";
import {Contig,FastaContigLoader} from "./../fastaContigLoader";
import {getQCReportSummaries} from "./../QCReportSummary";
import trimPath from "./../trimPath";
import {makeValidID} from "./../MakeValidID";
import {SpawnRequestParams} from "./../JobIPC";

import {Job,JobCallBackObject} from "./../main/Job";

import {bowTie2Build} from "./indexFasta/bowTie2Build";
import {faToTwoBit} from "./indexFasta/faToTwoBit";
import {samToolsFaidx} from "./indexFasta/samToolsFaidx";
export class IndexFasta extends atomic.AtomicOperation
{
    public fasta : Fasta;

    public faToTwoBitExe : string;
    public samToolsExe : string;
    public bowtie2BuildExe : string;


    public twoBitPath : string;
    public twoBitJob : Job;
    public twoBitFlags : atomic.CompletionFlags;

    public faiPath : string;
    public faiJob : Job;
    public faiFlags : atomic.CompletionFlags;

    public bowTieIndexPath : string;
    public bowtieJob : Job;
    public bowtieFlags : atomic.CompletionFlags;
    public bowtieSizeThreshold : number;
    public bowtieIndices : Array<string>;
    constructor()
    {
        super();
        this.twoBitFlags = new atomic.CompletionFlags();
        this.faiFlags = new atomic.CompletionFlags();
        this.bowtieFlags = new atomic.CompletionFlags();

        this.bowtieIndices = new Array<string>();

        //the size threshold between being 32-bit and being 64-bit
        this.bowtieSizeThreshold = 4294967096;

        this.faToTwoBitExe = 'resources/app/faToTwoBit';
        this.samToolsExe = 'resources/app/samtools';
        if(process.platform == "linux")
            this.bowtie2BuildExe = 'resources/app/bowtie2-build';
        else if(process.platform == "win32")
            this.bowtie2BuildExe = 'resources/app/python/python.exe';
    }
    public setData(data : Fasta) : void
    {
        this.fasta = data;

        this.twoBitPath = `resources/app/rt/indexes/${this.fasta.uuid}.2bit`;
        this.destinationArtifacts.push(this.twoBitPath);

        this.fasta.twoBit = this.twoBitPath;

        this.faiPath = `resources/app/rt/indexes/${this.fasta.uuid}.fai`;
        this.destinationArtifacts.push(this.faiPath);
        this.fasta.fai = this.faiPath;

        //samtool faidx will write the .fai beside the input fasta
        this.generatedArtifacts.push(`${this.fasta.path}.fai`);

        this.bowTieIndexPath = `resources/app/rt/indexes/${this.fasta.uuid}`;

        //if 64-bit, add a 1 to the file extension
        let x64 : string = (this.fasta.size > this.bowtieSizeThreshold ? "1" : "");

        this.bowtieIndices.push(`${this.bowTieIndexPath}.1.bt2${x64}`);
        this.bowtieIndices.push(`${this.bowTieIndexPath}.2.bt2${x64}`);
        this.bowtieIndices.push(`${this.bowTieIndexPath}.3.bt2${x64}`);
        this.bowtieIndices.push(`${this.bowTieIndexPath}.4.bt2${x64}`);
        this.bowtieIndices.push(`${this.bowTieIndexPath}.rev.1.bt2${x64}`);
        this.bowtieIndices.push(`${this.bowTieIndexPath}.rev.2.bt2${x64}`);

        this.destinationArtifacts.concat(this.bowtieIndices);
        
    }
    //faToTwoBit -> samTools faidx -> bowtie2-build -> ContigLoader
    public run() : void
    {
        let self = this;

        faToTwoBit(self).then((result) => {

            self.setSuccess(self.twoBitFlags);
            self.update();

            samToolsFaidx(self).then((result) => {

                self.setSuccess(self.faiFlags);
                self.update();

                bowTie2Build(self).then((result) => {

                    self.setSuccess(self.bowtieFlags);
                    self.update();

                    let contigLoader = new FastaContigLoader();
                    contigLoader.on(
                        "doneLoadingContigs",function(){
                            self.fasta.contigs = contigLoader.contigs;
                            self.setSuccess(self.flags);
                            self.fasta.indexed = true;
                            self.update();
                        }
                    );
                    contigLoader.beginRefStream(self.fasta.path);

                }).catch((err) => {
                    self.abortOperationWithMessage(err);
                });
            }).catch((err) => {
                self.abortOperationWithMessage(err);
            });
        }).catch((err) => {
            self.abortOperationWithMessage(err);
        });
    }
}