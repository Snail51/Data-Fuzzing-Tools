import { Reader } from "./reader.js";

// MAIN WRAPPER CLASS FOR `heatmapAnalyzer.html`

export class heatmap
{
    constructor(eid_orig, eid_mutants, eid_header)
    {
        this.read_orig = new Reader(eid_orig); // reader for reading original file (SINGLE)
        this.read_mutants = new Reader(eid_mutants); // reader for reading mutant files (MULTIPLE)
        this.head = eid_header; // <input> for specifying header size (integer)

        this.orig;
        this.mutants = new Array();
        this.headerSize = 0;

        this.map = new Array(150).fill(0);
    }

    async execute()
    {
        document.getElementById("result").innerHTML = "processing...";

        this.headerSize = parseInt(document.getElementById(this.head).value); // get header value

        // read the original file as bytes
        this.orig = await this.read_orig.readSingleAsBytes();
        this.orig = this.orig.data;
        this.orig = this.orig.slice(0,this.headerSize);

        //read mutant files as bytes
        const refresh = setInterval(function(){document.getElementById("result").innerHTML = "reading mutant " + this.read_mutants.progress}.bind(this), 100); // progress bar
        this.mutants = await this.read_mutants.readMultipleAsBytes(); // progress bar
        clearInterval(refresh); // progress bar

        // remove irrelevant bytes (trim to header size)
        var holder = new Array();
        for(var mutant of this.mutants)
        {
            holder.push(mutant.data.slice(0,this.headerSize));
        }
        this.mutants = holder;

        //console.log(this.orig);
        //console.log(this.mutants);

        // Create an array that will represent each byte index for the heatmap
        // Each value starts at 0 and is increased each time each mutant's byte differs from the original
        this.map = new Array(this.headerSize).fill(0);
        for(var mutant of this.mutants)
        {
            for(var i=0; i < this.headerSize; i++)
            {
                //console.log(mutant[i], this.orig[i]);
                if(mutant[i] != this.orig[i])
                {
                    this.map[i]++;
                }
            }
        }

        // find the largest value in the map array
        // this will be used to calibrate the red->green hue of each <span> for each byte
        var max = 0;
        for(var point of this.map)
        {
            if(point >= max)
            {
                max = point;
            }
        }
        
        // draw everything to the screen
        var display = "Header Size: " + this.headerSize + "<br>";
        var counter = 0;
        for(var point of this.map)
        {
            // each index is padded to be of equal length and colored red->green where red is 0 changes and green is the max # of changes present
            // effectively, the reder the index the less it changed. the greener the index, the more it changed.
            var span_start = "<span style=\'color: rgb(" + 255 * (1-(point / max)) + ", " + 255 * (point / max) + ", 0)\'>";
            display += span_start + counter.toString(10).padStart(this.headerSize.toString(10).length, "0") + "</span>, ";
            counter++;
            if(counter % 10 == 0)
            {
                display += "<br>";
            }
        }
        display = display.substring(0, display.length-2);

        document.getElementById("result").innerHTML = display;
    }
}