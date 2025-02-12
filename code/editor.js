import { Reader } from "./reader.js";
import { Provider } from "./provider.js";

// MAIN WRAPPER CLASS FOR `byteEditor.html`

export class Editor
{
    constructor(eid_input, eid_byteSelector, eid_replaceSelector, eid_linkOut)
    {
        this.read_input = new Reader(eid_input); // reader for reading input files (MULTIPLE)

        this.byteSelector = document.getElementById(eid_byteSelector); // element for specifying what byte to modify
        this.replaceSelector = document.getElementById(eid_replaceSelector); // element for specifying the value of the byte after replacement

        this.provide_mutant = new Provider(eid_linkOut); // provider for providing download
        this.provideLink = document.getElementById(eid_linkOut);

        this.infiles = new Array(); // the files that will be used as input
        this.outfiles = new Array(); // the files that will be provided as output
        this.outzip; // the zip file used for output
    }



    async execute()
    {
        this.provideLink.href = null;
        this.provideLink.download = null;
        this.provideLink.innerHTML = "Editing files... please wait...";

        // read input files into Uint8Array
        this.infiles = await this.read_input.readMultipleAsBytes();
        //==console.debug(this.infiles);

        // get operation values
        var byte = this.byteSelector.value;
        var replacement = this.replaceSelector.value;

        // do the replacement
        for (var i = 0; i < this.infiles.length; i++)
        {
            this.infiles[i].data[byte] = replacement;
            //==console.debug(`Replaced byte ${byte} of file ${this.infiles[i].name} to with value ${replacement}`);
        }

        // turn subfiles into URL objects
        this.provideFiles(this.infiles);
    }   

    // turn each subfile into a tracked URL object
    // DOES NOT MAKE THE ZIP FILE, just provides handles for external processing
    provideFiles(files)
    {
        // clear output zip file if it exists
        if(this.outzip)
        {
            URL.revokeObjectURL(this.outzip);
        }
        // clear output files if they exist
        if(this.outfiles.length > 0)
        {
            for(var url of this.outfiles)
            {
                URL.revokeObjectURL(url);
            }
            this.outfiles = new Array();
        }
        
        // generate URL objects for each output file
        for ( var file of files )
        {
            var name = file.name;
            var data = file.data;
            var type = file.type;
            var blob = new File([data], name, { type: type });
            this.outfiles.push(URL.createObjectURL(blob));
        }
    }
}
