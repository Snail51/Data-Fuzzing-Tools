/**
 * The Provider class embeds itself to the <a> element with the given Id, and mannages it.
 * It is capable of creating new tmp files from provided data and serving them to the client.
 * It is also capable of releasing previously served files to not waste memory.
 */
export class Provider
{
    constructor(linkElementId)
    {
        this.element = document.getElementById(linkElementId);
        this.serve;
    }

    /**
     * Resets the link element and turns it into an inert state.
     * Also frees the memory of old URL provides.
     */
    clear()
    {
        if(this.serve != null)
        {
            URL.revokeObjectURL(this.serve);
        }
        this.element.href = null;
        this.element.download = null;
        this.element.innerHTML = "Processing... Please Wait...";
    }

    /**
     * Produces a blob with the given data, type, and name, and makes download of that blob
     * avilible at the link element bound to the class.
     * @param name - The default name the file will have for download.
     * @param type - The type parameter specifies the type of data that is being provided. EX: text/plain.
     * @param data - String or Bytes representing the file's data
     */
    provide(name, type, data)
    {
        this.clear();
        var blob = new Blob([data], {type});
        this.serve = URL.createObjectURL(blob);
        this.element.href = this.serve;
        this.element.download = name;
        this.element.innerHTML = name;
        return this.serve;
    }

    /**
     * Return the object to an inert state, displaying an error message.
     */
    error()
    {
        this.clear();
        this.element.innerHTML = "Error. Process Aborted.";
    }
}