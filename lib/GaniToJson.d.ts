type GaniAnimationAttributes = {
    continuous?: boolean;
    loop?: boolean;
    setBackTo?: string;
};
type GaniSpriteAttributes = {
    rotation?: number;
};
type GaniSpriteData = Array<number | string>;
type GaniAnimationFrame = {
    up?: Array<number>;
    down?: Array<number>;
    left?: Array<number>;
    right?: Array<number>;
    frame?: Array<number>;
    sounds?: Array<{
        name: string;
        time?: number;
        volume?: number;
    }>;
    wait?: number;
};
type GaniImage = any;
export type GaniJsonData = {
    images: Array<GaniImage>;
    animationAttributes: GaniAnimationAttributes;
    spriteAttributes: {
        [spriteId: string]: GaniSpriteAttributes;
    };
    sprites: {
        [spriteId: string]: GaniSpriteData;
    };
    animationFrames: Array<GaniAnimationFrame>;
};
export declare function parseAndSaveGaniFile(ganiFolderPath: string, ganiName: string, parsedFolderPath: string): Promise<GaniJsonData>;
export declare function parseGaniFile(ganiFolderPath: string, ganiName: string, toDirectoryPath?: string): Promise<GaniJsonData>;
export {};
