'use strict';

var SVGO = require('svgo');
var waveform = require('waveform-node');
var fs = require('fs');
var max = require('lodash.max');
var Readable = require('stream').Readable;
var color = process.env.SVG_STROKE || '#000';

var svgo = new SVGO();

// only create the gzipped output - no other temp files created!
function writeStream(fileout, result) {
  return new Promise(function (resolve, reject) {
    var data = new Readable();
    data.push(result.data);
    data.push(null);
    data.pipe(fs.createWriteStream(fileout)).on('finish', function () {
      return resolve('Done');
    }).on('error', function (err) {
      return reject(err);
    });
  });
}

function buildSVG(filepath) {
  function svgPath(peaks) {
    var content = peaks.map(function (peak, i) {
      var bucketSVGWidth = 1;
      var bucketSVGHeight = peak * 100.0;
      return '<rect\n            x="' + bucketSVGWidth * i + '"\n            y="' + (100 - bucketSVGHeight) / 2.0 + '"\n            width="' + bucketSVGWidth + '"\n            height="' + bucketSVGHeight + '" />';
    }).join('');

    var maxPeak = max(peaks);

    return '\n      <svg viewBox="0 0 ' + peaks.length + ' ' + maxPeak * 100 + '" xmlns="http://www.w3.org/2000/svg">\n        ' + content + '\n      </svg>\n    ';
  }

  return new Promise(function (resolve, reject) {
    waveform.getWaveForm(filepath, {}, function (error, peaks) {
      if (error) {
        reject(error);
      } else {
        resolve(svgPath(peaks));
      }
    });
  });
}

function audioToSvgWaveform(audioin, fileout) {
  return new Promise(function (resolve, reject) {
    try {
      var newfile = fileout || audioin + '.svg';

      buildSVG(audioin).then(function (data) {
        return svgo.optimize(data);
      }).then(function (result) {
        return writeStream(newfile, result);
      }).then(resolve).catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = audioToSvgWaveform;