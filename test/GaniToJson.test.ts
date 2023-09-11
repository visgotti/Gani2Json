import { parseGaniFile, parseAndSaveGaniFile } from '../src';
import * as mocha from 'mocha';
import * as assert from 'assert';
import * as path from 'path';
import { cwd } from 'process';
import * as fs from 'fs';


describe('parseGaniFile', () => {
  it('parses correctly', async () => {
    const expected =  JSON.parse(fs.readFileSync( path.join(__dirname, 'expectedOutputs', 'walk.json'), 'utf-8'));
    const parsed = await parseGaniFile(path.join(__dirname, 'files'), 'walk.gani');
    assert.deepEqual(parsed, expected)
  });
});