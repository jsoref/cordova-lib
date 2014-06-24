/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

/* jshint node:true, bitwise:true, undef:true, trailing:true, quotmark:true,
          indent:4, unused:vars, latedef:nofunc
*/

var fs            = require('fs'),
    path          = require('path'),
    xml           = require('../../util/xml-helpers'),
    util          = require('../util'),
    events        = require('../../events'),
    shell         = require('shelljs'),
    Q             = require('q'),
    ConfigParser = require('../../configparser/ConfigParser'),
    CordovaError = require('../../CordovaError');


module.exports = function ripple_parser(project) {
    // if (!fs.existsSync(path.join(project, 'AndroidManifest.xml'))) {
    //     throw new CordovaError('The provided path "' + project + '" is not an Android project.');
    // }
    this.path = project;
    // this.strings = path.join(this.path, 'res', 'values', 'strings.xml');
    // this.manifest = path.join(this.path, 'AndroidManifest.xml');
    this.config = path.join(this.path, 'config.xml');
};

// Returns a promise.
module.exports.check_requirements = function(project_root) {
    // Rely on platform's bin/create script to check requirements.
    return Q(true);
};

module.exports.prototype = {
    update_from_config:function(config) {
        if (config instanceof ConfigParser) {
        } else throw new Error('update_from_config requires a ConfigParser object');
    },

    // Returns the platform-specific www directory.
    www_dir: function() {
        return path.join(this.path, 'www');
    },

    config_xml: function(){
        return this.config;
    },

     // Used for creating platform_www in projects created by older versions.
    cordovajs_path: function(libDir) {
        return path.resolve(path.join(libDir, 'cordova.js'));
    },

    // Replace the www dir with contents of platform_www and app www.
    update_www:function() {
        var projectRoot = util.isCordova(this.path);
        var app_www = util.projectWww(projectRoot);
        var platform_www = path.join(this.path, 'platform_www');

        // Clear the www dir
        shell.rm('-rf', this.www_dir());
        shell.mkdir(this.www_dir());
        // Copy over all app www assets
        shell.cp('-rf', path.join(app_www, '*'), this.www_dir());
        // Copy over stock platform www assets (cordova.js)
        shell.cp('-rf', path.join(platform_www, '*'), this.www_dir());
    },

    // update the overrides folder into the www folder
    update_overrides:function() {
        var projectRoot = util.isCordova(this.path);
        var merges_path = path.join(util.appDir(projectRoot), 'merges', 'ripple');
        if (fs.existsSync(merges_path)) {
            var overrides = path.join(merges_path, '*');
            shell.cp('-rf', overrides, this.www_dir());
        }
    },

    // Returns a promise.
    update_project:function(cfg) {
        var platformWww = path.join(this.path, 'www');
        try {
            this.update_from_config(cfg);
        } catch(e) {
            return Q.reject(e);
        }
        this.update_overrides();
        return Q();
    }
};
