import { parseGaniFile } from '../src';
import * as mocha from 'mocha';
import * as assert from 'assert';
import * as path from 'path';
import { cwd } from 'process';
import * as fs from 'fs';


describe('parseGaniFile', () => {
  it('parses correctly', async () => {
    const expected =  JSON.parse(fs.readFileSync( path.join(__dirname, 'expectedOutputs', 'walk.json'), 'utf-8'));
    const parsed = await parseGaniFile(path.join(__dirname, 'files'), 'walk.gani', process.cwd());
    assert.deepEqual(parsed.animationAttributes, expected.animationAttributes);
    assert.deepEqual(parsed.animationFrames, expected.animationFrames);
    assert.deepEqual(parsed.images, expected.images);
    assert.deepEqual(parsed.sprites, expected.sprites);
    assert.deepEqual(parsed.spriteAttributes, expected.spriteAttributes);
  });
});

//for now use this if you want to parse a file
describe('parseGaniFile', () => {
  it('parses correctly', async () => {
    const expected =  JSON.parse(fs.readFileSync( path.join(__dirname, 'expectedOutputs', 'walk.json'), 'utf-8'));
    const parsed = await parseGaniFile(path.join(__dirname, 'files'), 'walk.gani', process.cwd());
    assert.deepEqual(parsed.animationAttributes, expected.animationAttributes);
    assert.deepEqual(parsed.animationFrames, expected.animationFrames);
    assert.deepEqual(parsed.images, expected.images);
    assert.deepEqual(parsed.sprites, expected.sprites);
    assert.deepEqual(parsed.spriteAttributes, expected.spriteAttributes);
  });
});