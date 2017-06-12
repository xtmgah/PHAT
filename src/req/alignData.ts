const uuidv4 : () => string = require("uuid/v4");

let dFormat = require('./dateFormat');
import Fastq from "./fastq";
import {Fasta} from "./fasta";
import {Bowtie2Report} from "./bowTie2AlignmentReportParser";
import {varScanMPileup2SNPReport} from "./varScanMPileup2SNPReportParser";
import {SamToolsIdxStatsReport} from "./samToolsIdxStatsReport";
export default class alignData
{
    public uuid : string;
    public fastqs : Array<Fastq>;
    public dateStampString : string;
    public dateStamp : string;
    public alias : string;
    public invokeString : string;
    public fasta : Fasta;
    public type : string;
    public summary : Bowtie2Report;
    public summaryText : string;
    public varScanSNPSummary : varScanMPileup2SNPReport;
    public varScanSNPReport : string;
    public idxStatsReport : Array<SamToolsIdxStatsReport>; 
    public constructor()
    {
        this.fastqs = new Array();
        this.dateStampString = "";
        this.dateStamp = "";
        this.alias = "";
        this.invokeString = "";
        this.type = "";
        this.summaryText = "";
        this.dateStamp = dFormat.generateFixedSizeDateStamp();
        this.dateStampString = dFormat.formatDateStamp(this.dateStamp);
        this.uuid = uuidv4();
    }
}