import { Reader } from "./reader.js";

export class heatmap
{
    constructor(eid_orig, eid_mutants, eid_header)
    {
        this.read_orig = new Reader(eid_orig);
        this.read_mutants = new Reader(eid_mutants);
        this.head = eid_header;

        this.orig;
        this.mutants = new Array();
        this.headerSize = 0;

        this.map = new Array(150).fill(0);
    }

    async execute()
    {
        document.getElementById("result").innerHTML = "processing...";

        this.headerSize = parseInt(document.getElementById(this.head).value);

        this.orig = await this.read_orig.readSingleAsBytes();
        this.orig = this.orig.data;
        this.orig = this.orig.slice(0,this.headerSize);

        //read mutant files
        const refresh = setInterval(function(){document.getElementById("result").innerHTML = "reading mutant " + this.read_mutants.progress}.bind(this), 100);
        this.mutants = await this.read_mutants.readMultipleAsBytes();
        clearInterval(refresh);
        var holder = new Array();
        for(var mutant of this.mutants)
        {
            holder.push(mutant.data.slice(0,this.headerSize));
        }
        this.mutants = holder;

        //console.log(this.orig);
        //console.log(this.mutants);

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

        var max = 0;
        for(var point of this.map)
        {
            if(point >= max)
            {
                max = point;
            }
        }
        var width = max.toString().length;

        var display = "Header Size: " + this.headerSize + "<br>";
        var counter = 0;
        for(var point of this.map)
        {
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