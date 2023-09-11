"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGaniFile = exports.parseAndSaveGaniFile = void 0;
const console_1 = require("console");
var path = require('path');
var readline = require("readline");
var fs = require("fs");
const INDEX_TO_DIRECTION_MAP = {
    0: "up",
    1: "left",
    2: "down",
    3: "right"
};
const SPRITE_INDEX_MAP = {
    imageIndex: 0,
    x: 1,
    y: 2,
    w: 3,
    h: 4
};
class GaniToJson {
    constructor(folderPath, fileName, toFolderPath) {
        this.animationIndex = 0;
        this.singleDirection = false;
        this.inAnimation = false;
        this.finishedAnimation = false;
        this.folderPath = folderPath;
        if (toFolderPath) {
            this.toFolderPath = path.resolve(toFolderPath);
        }
        else {
            this.toFolderPath = null;
        }
        if (fileName.includes('.gani')) {
            fileName = fileName.replace(/\.[^/.]+$/, "");
        }
        this.fileName = fileName;
        console.log('resolving', this.folderPath, 'and', fileName + '.gani');
        this.filePath = path.resolve(this.folderPath, fileName + ".gani");
        this.jsonObject = {
            // use this to keep track of image names so it's not repeating
            images: [],
            animationAttributes: {},
            spriteAttributes: {},
            sprites: {},
            animationFrames: [],
        };
        this.animationFrames = [];
        this.animationFrames[this.animationIndex] = [];
        this.singleDirection = false;
        this.inAnimation = false;
        this.finishedAnimation = false;
        console.log('creating interface for', this.filePath);
        this.lineReader = readline.createInterface({
            input: fs.createReadStream(this.filePath)
        });
    }
    parse() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('finna parse');
            this.lineReader.on('line', (line) => {
                var lineType = line.replace(/ .*/, '');
                // get all string after the linetype
                var lineData = (line.slice(line.indexOf(lineType) + lineType.length)).trim();
                switch (lineType) {
                    case "SPRITE":
                        var sprite = this.getSpriteJsonFromLine(line);
                        this.jsonObject.sprites[sprite.id] = sprite.array;
                        break;
                    case "SETBACKTO":
                        this.jsonObject.animationAttributes["setBackToAnimation"] = lineData;
                        break;
                    case "ROTATEEFFECT":
                        var lineDataArray = lineData.split(/[ ]+/);
                        var spriteId = lineDataArray[0];
                        var rotation = lineDataArray[1];
                        if (!(spriteId in this.jsonObject.spriteAttributes)) {
                            this.jsonObject.spriteAttributes[spriteId] = {};
                        }
                        this.jsonObject.spriteAttributes[spriteId]["rotation"] = rotation;
                        break;
                    case "LOOP":
                        this.jsonObject.animationAttributes["loop"] = true;
                        break;
                    case "CONTINUOUS":
                        this.jsonObject.animationAttributes["continuous"] = true;
                        break;
                    case "SINGLEDIRECTION":
                        this.singleDirection = true;
                        break;
                    case "ANI":
                        this.inAnimation = true;
                        break;
                    case "ANIEND":
                        this.finishedAnimation = true;
                        this.inAnimation = false;
                        break;
                    default:
                        if (this.inAnimation && !this.finishedAnimation) {
                            this.compileIntoAnimation(line);
                            //jsonObject.animations[animation.id] = sprite;
                        }
                        ;
                }
            });
            return new Promise((resolve, reject) => {
                this.lineReader.on('close', () => {
                    // console.log('the final jsonObject was', jsonObject);
                    if (this.singleDirection) {
                        this.parseSingleDirectionAnimationFrames();
                    }
                    else {
                        this.parseAnimationFrames();
                    }
                    return resolve(this.jsonObject);
                });
            });
        });
    }
    saveParsed() {
        if (this.toFolderPath === null)
            throw new Error(`Must specify folder path to save to as third param in contructor if you want to save.`);
        var json = JSON.stringify(this.jsonObject, null, 2);
        var jsonsmall = JSON.stringify(this.jsonObject);
        fs.writeFileSync(path.join(this.toFolderPath, 'min_' + this.fileName + '.json'), jsonsmall, 'utf8');
        fs.writeFileSync(path.join(this.toFolderPath, this.fileName + '.json'), json, 'utf8');
    }
    parseAndSave() {
        return __awaiter(this, void 0, void 0, function* () {
            const d = yield this.parse();
            console_1.assert(d === this.jsonObject);
            this.saveParsed();
            return d;
        });
    }
    parseAnimationFrames() {
        var animationFrames = this.animationFrames;
        for (var i = 0; i < animationFrames.length; i++) {
            var animationJson = {};
            for (var j = 0; j < animationFrames[i].length; j++) {
                //@ts-ignore
                var frameType = animationFrames[i][j].replace(/ .*/, '');
                // if its in the first 3 that means its a frame for a direction
                if (j <= 3) {
                    // split each sprite by commans to put into array
                    //@ts-ignore
                    var tempArray = animationFrames[i][j].trim().split(',');
                    for (var k = 0; k < tempArray.length; k++) {
                        // then split each sprite code and x y +- by commas to keep into array
                        tempArray[k] = tempArray[k].trim().split(/[ ]+/);
                        for (var l = 0; l < tempArray[k].length; l++) {
                            // finally we want these values to integers so parse.
                            tempArray[k][l] = parseInt(tempArray[k][l]);
                        }
                    }
                    animationJson[INDEX_TO_DIRECTION_MAP[j]] = tempArray;
                }
                if (frameType == "PLAYSOUND" || frameType == "WAIT") {
                    //@ts-ignore
                    var tempArray = animationFrames[i][j].trim().split(' ');
                    tempArray = tempArray.slice(1, tempArray.length);
                    animationJson[frameType.toLowerCase()] = tempArray;
                }
            }
            // after looping through the whole frame we can push it to the animation frame array of the json
            this.jsonObject.animationFrames.push(animationJson);
        }
    }
    parseSingleDirectionAnimationFrames() {
        const animationFrames = this.animationFrames;
        for (var i = 0; i < animationFrames.length; i++) {
            var animationJson = {};
            for (var j = 0; j < animationFrames[i].length; j++) {
                var frameType = animationFrames[i][j].replace(/ .*/, '');
                switch (frameType) {
                    case "PLAYSOUND":
                    case "WAIT":
                        var tempArray = animationFrames[i][j].trim().split(' ');
                        tempArray = tempArray.slice(1, tempArray.length);
                        animationJson[frameType.toLowerCase()] = tempArray;
                        break;
                    case "":
                        var tempArray = animationFrames[i][j].trim().split(',');
                        for (var k = 0; k < tempArray.length; k++) {
                            // then split each sprite code and x y +- by commas to keep into array
                            tempArray[k] = tempArray[k].trim().split(/[ ]+/);
                            for (var l = 0; l < tempArray[k].length; l++) {
                                // finally we want these values to integers so parse.
                                tempArray[k][l] = parseInt(tempArray[k][l]);
                            }
                        }
                        animationJson["frame"] = tempArray;
                        break;
                    default:
                        console.log('unhandled frameType:', frameType);
                }
            }
            // after looping through the whole frame we can push it to the animation frame array of the json
            this.jsonObject.animationFrames.push(animationJson);
        }
    }
    compileIntoAnimation(line) {
        // checks to see if theres an enter which indicates new frame
        if (/^\s*$/.test(line)) {
            this.animationIndex++;
            this.animationFrames[this.animationIndex] = [];
        }
        else {
            this.animationFrames[this.animationIndex].push(line);
        }
    }
    getSpriteJsonFromLine(line) {
        var items = line.split(/[ ]+/);
        // each line should have 8 items, if there's more after 8 that means its because
        // the last item has spaces in it and we need to concat it and make sure the length stays 8
        if (items.length > 8) {
            var spriteName = [];
            //iterate through the left
            for (var i = 7; i < items.length; i++) {
                spriteName.push(items[i]);
            }
            items[7] = spriteName.join(" ");
            items = items.slice(0, 8);
        }
        var imageName = items[2];
        // get the current image index
        var imageIndex = this.jsonObject.images.indexOf(imageName);
        // if the image index is not greater than -1 it's not in the image array yet.
        // push it and get the index length - 1
        if (!(imageIndex > -1)) {
            this.jsonObject.images.push(imageName);
            imageIndex = this.jsonObject.images.length - 1;
        }
        return {
            id: items[1],
            array: [
                imageIndex,
                items[3],
                items[4],
                items[5],
                items[6],
            ]
        };
    }
}
function parseAndSaveGaniFile(ganiFolderPath, ganiName, parsedFolderPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const f = new GaniToJson(ganiFolderPath, ganiName, parsedFolderPath);
        return f.parseAndSave();
    });
}
exports.parseAndSaveGaniFile = parseAndSaveGaniFile;
;
function parseGaniFile(ganiFolderPath, ganiName) {
    return __awaiter(this, void 0, void 0, function* () {
        const f = new GaniToJson(ganiFolderPath, ganiName);
        return f.parse();
    });
}
exports.parseGaniFile = parseGaniFile;
;
