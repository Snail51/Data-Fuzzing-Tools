import { Reader } from "./reader.js";
import { Provider } from "./provider.js";

// MAIN WRAPPER CLASS FOR `autoFuzzer.html`

export class Fuzzer
{
    constructor(eid_orig, eid_byteSelector, eid_chanceSelector, eid_imageOut, eid_linkOut, eid_listOut)
    {
        this.read_orig = new Reader(eid_orig); // reader for reading input original file

        this.byteSelector = document.getElementById(eid_byteSelector); // element for specifying what bytes to fuzz
        this.chanceSelector = document.getElementById(eid_chanceSelector); // element for specifying the chance that any given byte will be fuzzed

        this.provide_mutant = new Provider(eid_linkOut); // provider for providing download
        this.preview = document.getElementById(eid_imageOut); // element for drawing preview image
        this.modifiedList = document.getElementById(eid_listOut);

        this.orig; // the file that will be used as input
    }



    async execute()
    {
        // wait 0.1 seconds (used to slow down `onerror` repeats)
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        await sleep(100);

        // read original file into Uint8Array
        this.orig = await this.read_orig.readSingleAsBytes();

        // fetch fuzzing operation parameters
        var targets = this.byteSelector.value;
        if(targets == null || targets == "")
        {
            targets = "2-255";
        }
        var targets = this.convertStringToRanges(targets);
        targets = targets.filter(element => element <= this.orig.data.length);
        targets = targets.filter(element => element >= 0);
        var chance = this.chanceSelector.value;

        // do the fuzzing
        this.modifiedList.innerHTML = "Bytes modified:<br>";
        for (var target of targets)
        {
            var oldByte = this.orig.data[target];
            var newByte = this.fuzzByte(chance, this.orig.data[target]);

            if(oldByte != newByte)
            {
                this.modifiedList.innerHTML += `[<span style="color: yellow">${target}</span>](<span style="color: red">${oldByte}</span>-&gt;<span style="color: lime">${newByte}</span>), `;
            }

            this.orig.data[target] = newByte;
        }

        // export the result
        var oldName = this.orig.name.split(".")[0];
        var oldExtension = this.orig.name.split(".")[1];
        var newName = oldName + "_" + Date.now() + "." + oldExtension;
        var serveURL = this.provide_mutant.provide(newName, this.orig.type, this.orig.data);

        //this.preview.onerror = () => this.execute(); THIS HAS BEEN MOVE TO THE HTML
        this.preview.src = serveURL;
    }   

    // given a byte, if the given CHANCE is met, replace that value with a random byte
    // else return the original byte
    fuzzByte(chance, orig)
    {
        const randNum = Math.random();
        if(randNum < chance)
        {
            var newNum = Math.random();
            newNum = newNum * 255;
            newNum = Math.round(newNum);
            return newNum;
        }
        else
        {
            return orig;
        }
    }

    // convert ranges string to array
    // ex: "1-10;12;20-23" -> [1,2,3,4,5,6,7,8,9,10,12,20,21,22,23]
    convertStringToRanges(input)
    {
        // Split the input by ';'
        const ranges = input.split(';');
        
        // Initialize the result array
        const result = [];
        
        // Process each range
        ranges.forEach(range => {
            // Trim whitespace and split by '-'
            let [start, end] = range.trim().split('-');
        
            // Parse numeric values
            start = parseInt(start, 10);
            end = parseInt(end, 10);
        
            // Add single value to result
            if (isNaN(end)) {
            result.push(start);
            } 
            // Add range to result
            else {
            for (let i = start; i <= end; i++) {
                result.push(i);
            }
            }
        });
        
        return result.filter(Number.isInteger);
    }
}
