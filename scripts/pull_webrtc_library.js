'use strict'

// this repository is the same as used by CocoaPods libjingle_peerconnection
var webrtcPodUrl = 'https://s3.amazonaws.com/libjingle/9792/Release/0/libWebRTC.tar.bz2';

var path = require('path');
var childProcess = require('child_process');
var https = require('https');
var fs = require('fs');
var mkirp = require('mkdirp');

var tempFile = path.join(process.cwd(), '.tmp.libwebrtc');

module.exports = function (context) {

    var destFolder = path.join(context.opts.plugin.dir, 'libs/ios/');
    var Q = context.requireCordovaModule('q');
    var deferral = new Q.defer();
    
    mkirp.sync(destFolder);

    console.log('Fetching WebRTC libraries, stand by...');

    https.get(webrtcPodUrl, function (res) {
        res.pipe(fs.createWriteStream(tempFile));
        res.on('end', function () {
            console.log('Extracting...');

            var decomp = childProcess.spawn('tar', ['jxf', tempFile, '--strip', '1'], {
                cwd: destFolder
            });
            decomp.on('error', function (err) {
                throw err;
            });
            decomp.on('close', function (code) {
                console.log('Done!');
                if (code !== 0) {
                    throw 'Could not extract webrtc libraries';
                }
                deferral.resolve();
            });
        });
    }).on('error', function (err) {
        throw err;
    });
    return deferral.promise;};
