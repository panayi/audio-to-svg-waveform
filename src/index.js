const SVGO = require('svgo');
const waveform = require('waveform-node');
const fs = require('fs');
const max = require('lodash.max');
const Readable = require('stream').Readable;
const color = process.env.SVG_STROKE || '#000';

const svgo = new SVGO(/*{ custom config object }*/);

// only create the gzipped output - no other temp files created!
function writeStream(fileout, result) {
  return new Promise((resolve, reject) => {
    const data = new Readable();
    data.push(result.data);
    data.push(null);
    data
      .pipe(fs.createWriteStream(fileout))
      .on('finish', () => resolve('Done'))
      .on('error', err => reject(err));
  });
}

function buildSVG(filepath) {
  function svgPath(peaks) {
    const content = peaks.map((peak, i) => {
        let bucketSVGWidth = 1;
        let bucketSVGHeight = peak * 100.0;
        return `<rect
            x="${bucketSVGWidth * i}"
            y="${ (100 - bucketSVGHeight) / 2.0}"
            width="${bucketSVGWidth}"
            height="${bucketSVGHeight}" />`;
    }).join('')

    const maxPeak = max(peaks);

    return `
      <svg viewBox="0 0 ${peaks.length} ${maxPeak * 100}" xmlns="http://www.w3.org/2000/svg">
        ${content}
      </svg>
    `;
  }

  return new Promise((resolve, reject) => {
    waveform.getWaveForm(filepath, { }, (error, peaks) => {
      if (error) {
        reject(error);
      } else {
        resolve(svgPath(peaks));
      }
    });
  });
}

function audioToSvgWaveform(audioin, fileout) {
  return new Promise((resolve, reject) => {
    try {
      const newfile = fileout || `${audioin}.svg`;

      buildSVG(audioin)
        .then(data => svgo.optimize(data))
        .then(result => writeStream(newfile, result))
        .then(resolve)
        .catch(reject);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = audioToSvgWaveform;
