const audioToSvgWaveform = require('../src/index');
const fs = require('fs');

const chai = require('chai');

chai.should();
const expect = chai.expect;

describe('Main', () => {
  it('Can create a compressed SVG file from an audio file', () => {
    audioToSvgWaveform('./test/input/bensound-ukulele.mp3', './test/output/bensound-ukulele.svg')
      .then(() => {
        console.log('complete!');
        expect(fs.existsSync('./test/infile.svg')).to.equal(true);
      })
      .catch((err) => {
        return err;
      });
  });

  it('Can create an output file without a specified output', () => {
    audioToSvgWaveform('./test/input/infile.mp3')
      .then(() => {
        console.log('complete!');
        expect(fs.existsSync('./test/input/infile.mp3.svg')).to.equal(true);
      })
      .catch((err) => {
        return err;
      });
  });

  it('Will fail when no file is added', () => {
    audioToSvgWaveform(null, './test/infile.svg.gz')
      .catch((err) => {
        expect(err).to.be.a('object');
      });
  })
});
