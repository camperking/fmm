$("#maintext").html(process.version);
var fs = require("fs");
var JSZip = require("jszip");
var gui = require('nw.gui');
var mod = require("./js/mods.js");
var settings = require("./js/settings.js");
var async = require("async");
var spawn = require("child_process").spawn;

modpath = "mods/";
var modfile;

var mods = [];

var tabs = {
    'tab_installed' : '',
    'tab_available' : '',
    'tab_settings'  : ''
};


$(document).ready(function () {
    settings.load();

    $("#nav_installed").click(function () {
        show_tab("tab_installed", this);
    });

    $("#nav_available").click(function () {
        show_tab("tab_available", this);
    });

    $("#nav_settings").click(function () {
        show_tab("tab_settings", this);
    });

    $("#btn_save_settings").click(function () {
        settings.settings.modpath = $("#input_modpath").val() + "/";
        settings.settings.executable = $("#input_fexe").val();
        settings.save();
        show_tab("tab_installed", $("#nav_installed"));
        read_mods(settings.settings.modpath);
    });

    $("#btn_start_factorio").click(function () {
        writemodlist(function () {
            require("child_process").exec(settings.settings.executable, function (err) {
                if (err) {
                    msgalert("danger", err);
                }
            }).unref();
        });
    });






    if (settings.settings.modpath == "") {
        // read mod dir
        show_tab("tab_settings", $("#nav_settings"));
    } else {
        show_tab("tab_installed", $("#nav_installed"));
        read_mods(settings.settings.modpath);
    }
});

function msgalert(type, msg) {
    $("#alert").append("<div class=\"alert alert-"+ type +" alert-dismissible fade in\" role=\"alert\">"+ msg +
                       "<button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">"+
                       "<span aria-hidden=\"true\">&times;</span></button></div>");
}

function show_tab(tab, _this) {
        $(_this).parent().siblings().removeClass("active");   // remove active from others
        $(_this).parent().addClass("active");                 // set this to active
        detach_tabs();                               // detach
        $("#main_window").append(tabs[tab]);         // append clicked tab
};


function detach_tabs() {
    $("div[id*='tab']").each(function () {       // find tab divs
        tabs[$(this).attr("id")] = this;         // save tab before detaching
        $(this).detach();
    });
};


function writemodlist(cb) {         // write mod-list.json with enabled mods
    var modlist;
    modlist = {"mods":[]};
    modlist.mods.push({"name":"base","enabled":"true"});
    mods.forEach(function (mod, index, array) {
        modlist.mods.push({"name":mod.name, "enabled":mod.active});
    });
    fs.writeFile(settings.settings.modpath + "mod-list.json", JSON.stringify(modlist), cb);
};

function readmodlist(cb) {      // read mod-list.json created by game
    fs.readFile(settings.settings.modpath + "mod-list.json", function (err, data) {
        if (!err) {
            var modlist = JSON.parse(data);
            modlist.mods.forEach(function (mod, index, array) {
                mods.forEach(function (_mod, _index, _array) {
                    if (mod.name == _mod.name) {
                        _mod.active = mod.enabled;
                    };
                });
            });
            cb();
        } else {
            cb();
        }
    });
};

function fill_installed_table(modinfo) {
    var mod_enabled = "<button type=\"button\" class=\"btn btn-success\" id=\"btn_activate\">"+
                      "<span class=\"glyphicon glyphicon-ok\"></span></button>";
    var mod_disabled = "<button type=\"button\" class=\"btn btn-danger\" id=\"btn_activate\">"+
                       "<span class=\"glyphicon glyphicon-remove\"></span></button>";
    var modactive;
    if(modinfo.active) { modactive = mod_enabled } else { modactive = mod_disabled }
    $("#modtable").append("<tr id=\"modtable_data\" data-modnumber=\""+ modinfo.modnumber +"\">"+
                          "<td>"+ modactive +"</td>"+
                          "<td>"+ modinfo.name +"</td>"+
                          "<td>"+ modinfo.version +"</td>"+
                          "<td>"+ modinfo.title +"</td>"+
                          "<td>"+ modinfo.author +"</td>"+
                          "<td><a href=\"#\" class=\"glyphicon glyphicon-trash\" id=\"deletemod\"></a>&nbsp;"+
                          "<a href=\"#\" class=\"glyphicon glyphicon-info-sign\" id=\"modlink\"></a></td>"+
                          "</tr>");
};

function read_mods(modpath) {
    $("tr[id='modtable_data']").remove();
    fs.readdir(modpath, function(err, files) {          //read files in mod directory
       if (err) throw err;
        var n = 0;
        var zipfiles = [];
        files.forEach(function (file) {         // filter all files except .zip
            if (file.indexOf(".zip") != -1) {
                zipfiles.push(file);
            }
        });
        async.map(zipfiles, function (file, callback) {      // asynch mod_obj.load
            var mod_obj = new mod(modpath + file);
            mod_obj.load(function () {                  // load and extract info.json
                callback(null, mod_obj);
            });
        }, function (err, results) {        // after async loading is done
            mods = results;
            readmodlist(function () {
                mods.forEach(function (mod, index, mods) {
                    mod.modnumber = index;
                    fill_installed_table(mod);
                });
                add_table_events();
            });

        });
    });
}


function add_table_events() {
    $("a[id='deletemod']").click(function () {
        //deletemodfile(this, $(this).parent().parent().dataset.modnumber);
        console.log($(this).parent().parent().attr("data-modnumber"));
        console.log("clickdelete");
        var modnumber = $(this).parent().parent().attr("data-modnumber");
        mods[modnumber].delete_mod();
        mods[modnumber] = "";
        $(this).parent().parent().remove();     // delete row on table
    });

    $("a[id='modlink']").click(function () {
        var modnumber = $(this).parent().parent().attr("data-modnumber");
        if (mods[modnumber].homepage.startsWith("http://")) {       //check if url begins with http://
            gui.Shell.openExternal(mods[modnumber].homepage);
        }
    });

    $("[id='btn_activate']").click(function () {
        if ($(this).hasClass("btn-danger")) {           // activate
            $(this).removeClass("btn-danger");
            $(this).addClass("btn-success");
            $(this).html("<span class=\"glyphicon glyphicon-ok\"></span>");
            var modnumber = $(this).parent().parent().attr("data-modnumber");
            mods[modnumber].active = true;
        } else {
            $(this).removeClass("btn-success");         //deactivate
            $(this).addClass("btn-danger");
            $(this).html("<span class=\"glyphicon glyphicon-remove\"></span>");
            var modnumber = $(this).parent().parent().attr("data-modnumber");
            mods[modnumber].active = false;
        }
    });

};


