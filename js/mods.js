var fs = require("fs");
var JSZip = require("jszip");

var modinfo;



module.exports = function (modfilepath) {
    this.file = modfilepath;
    this.modnumber;
    this.active = false;
    var _this = this;
    
    this.load = function (fn) {             // open zip and look for info.json
        fs.readFile(modfilepath, function(err, data) {
            if (err) throw err;
            var zip = new JSZip(data);
            zip.filter(function (relativePath, file) {
                if (relativePath.substring(relativePath.length - 9) == "info.json" && file.dir == false) {   // looking for info.json
                    modinfo = JSON.parse(zip.file(relativePath).asText());   // parse json.info
                    _this.name = modinfo.name;
                    _this.author = modinfo.author;
                    _this.version = modinfo.version;
                    _this.title = modinfo.title;
                    _this.contact = modinfo.contact;
                    _this.homepage = modinfo.homepage;
                    _this.description = modinfo.description;
                    _this.dependencies = modinfo.dependencies;
                    fn();    // callback
                }
            });
        });
    };

    this.delete_mod = function () {
        fs.unlink(modfilepath);
    }



}



