var fs = require("fs");


var settings_file = "./settings/settings.json";
exports.settings;

exports.load = function () {
    this.settings = JSON.parse(fs.readFileSync(settings_file));         // needs err handler if file not found
}

exports.save = function () {
    fs.writeFile(settings_file, JSON.stringify(this.settings));
}



