declare type GaniAnimationAttributes = any;
declare type GaniSpriteAttributes = any;
declare type GaniSpriteData = Array<number | string>;
declare type GaniAnimationFrame = {
    up?: Array<number>;
    down?: Array<number>;
    left?: Array<number>;
    right?: Array<number>;
    frame?: Array<number>;
    playsound?: Array<number>;
    wait?: Array<number>;
};
declare type GaniImage = any;
export declare type GaniJsonData = {
    images: Array<GaniImage>;
    animationAttributes: {
        [attributeKey: string]: GaniAnimationAttributes;
    };
    spriteAttributes: {
        [attributeKey: string]: GaniSpriteAttributes;
    };
    sprites: {
        [spriteId: string]: GaniSpriteData;
    };
    animationFrames: Array<GaniAnimationFrame>;
};
export declare function parseAndSaveGaniFile(ganiFolderPath: string, ganiName: string, parsedFolderPath: string): Promise<GaniJsonData>;
export declare function parseGaniFile(ganiFolderPath: string, ganiName: string): Promise<GaniJsonData>;
export {};
