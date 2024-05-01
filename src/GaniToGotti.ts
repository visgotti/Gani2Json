import { GaniJsonData } from "./GaniToJson";
export type AnimationFrameSoundData = {
  id: string,
  volume?: number,
  weight?: number
}
export type AnimationFrameSoundDataGroup = { id: string, play: Array<AnimationFrameSoundData>, x?: number, y?: number, volume?: number, evenWeightDistribution? : boolean }

export type BoneSetupFrameData = {
  id: string,
  name?: string,
  parentBoneId?: string,
  parentAttachmentSlotId?: number,
  parentAttachmentId?: number,
}

export type BoneSlotData = {
  uid: string,
  atlasId: string,
  rect: number[],
  tags?: string[],
  id?: string,
}
export type BoneFrameData = AnimationFrameTransformData & BoneSetupFrameData & {
  slotId?: number,
  slotName?: string,
  slot?: BoneSlotData,
  hide?: boolean,
  name?: string,
  zIndex?: number,
}

export type AnimationFrameTransformData = {
  x?: number,
  y?: number,
  scaleX?: number,
  scaleY?: number,
  rotation?: number,
  visible?: boolean,
}

export type FrameData = {
  bones?: Array<BoneFrameData>,
  sounds?: Array<AnimationFrameSoundDataGroup>,
}

export type AnimationFrameData = FrameData & {
  id?: number,
  level?: number,
  time: number,
  sounds?: Array<AnimationFrameSoundDataGroup>
}

export type AnimationData = {
  id: number,
  endTime: number,
  frameData: Array<AnimationFrameData>,
  direction: string,
  overriddenBones?: { slot?: Array<number | string>, zIndex?: Array<number | string> },
}

export type ActionAnimationData = {
  actionId: string,
  actionName: string,
  skeletonName: string,
  attachmentNames?: string[],
  attachmentIds?: number[],
  attachmentSlotNames?: string[],
  attachmentSlotIds?: number[],
  attachmentName?: string,
  attachmentId?: string | number,
  attachmentSlotId?: number,
  attachmentSlotName?: string,
  directions: {[key: string]: AnimationData },
  slots: {[slotId: string]: BoneSlotData }
}
type DirectionRemap = { up: string, down: string, left: string, right: string };
export type Opts = {
  action: string,
  skeletonName: string,
  attachments?: (string | number)[],
  attachmentSlots?: (string | number)[],
  directions?: DirectionRemap
  imageToAtlasNames?: {[imageName: string]: string }
}

const baseDirections = ["up", "down", "left", "right"];
const baseWaitTime = 100;

const usedInts = {};
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const int = Math.floor(Math.random() * (max - min + 1)) + min;
  if(int in usedInts) {
    return getRandomInt(min, max);
  }
  usedInts[int] = true;
  return int;
}

export function convert(data: GaniJsonData, opts: Opts) : ActionAnimationData {
  const slots = convertSpritesToSlots(data);
  const directions = convertAnimationFrames(data, slots, opts.directions);
  const obj : ActionAnimationData = {
    actionId: opts.action,
    actionName: opts.action,
    skeletonName: opts.skeletonName,
    directions,
    slots
  }
  if(opts.attachments) {
    obj.attachmentIds = opts.attachments as number[];
    obj.attachmentNames = opts.attachments as string[];
  }
  if(opts.attachmentSlots) {
    obj.attachmentSlotIds = opts.attachmentSlots as number[];
    obj.attachmentSlotNames = opts.attachmentSlots as string[];
  }
  return null;
}

/*
 down?:  Array<number>,
    left?: Array<number>,
    right?: Array<number>,
    frame?: Array<number>,
    sounds?: Array<{
        name: string,
        time?: number,
        volume?: number
    }>,
    wait?: number,
    */


export function convertAnimationFrames(data: GaniJsonData, slotLookup: {[slotId: string]: BoneSlotData }, directionRemap?: DirectionRemap,) : {[direction: string]: AnimationData }{
  const anis : {[direction: string]: AnimationData } = {};
  baseDirections.forEach(d => {
    let elapsedTime = 0;
    const direction = directionRemap?.[d] || d;
    anis[direction] = {
      id: getRandomInt(100000, 999999999),
      endTime: 0,
      frameData: [],
      direction
    }
    data.animationFrames.forEach(frame => {
      const atlasIdx = {};
      const getAtlasIdx = (atlasName: string) => {
        if(!(atlasName in atlasIdx)) {
          atlasIdx[atlasName] = 0;
        }
        return ++atlasIdx[atlasName];
      }
      anis[direction].frameData.push({
        id: getRandomInt(100000, 999999999),
        bones: frame[d].map((bones: number[], idx: number) => {
          const atlasName = slotLookup[bones[0]].atlasId;
          return {
            id: `${atlasName}_${getAtlasIdx(atlasName)}`,
            slotId: bones[0],
            x: bones[1],
            y: bones[2],
          };
        }),
        time: elapsedTime,
      });
      elapsedTime += (frame.wait || baseWaitTime)
    });
    anis[direction].endTime = elapsedTime;
  })

  return anis;
}

export function convertSpritesToSlots(data: GaniJsonData, imageToAtlasNames?: {[imageName: string]: string }) : {[slotId: string]: BoneSlotData } {
  const slots : {[slotId: string]: BoneSlotData} = {};
  for(let key in data.sprites) {
    const [imageIndex, x, y, w, h] = data.sprites[key];
    const imageName = data.images[imageIndex];
    const atlasId = imageToAtlasNames?.[imageName] || imageName;
    const rect = [x, y, w, h];
    slots[key] = {
      atlasId,
      rect,
      uid: `${atlasId}_${rect.join('_')}`,
    }
  }
  return slots;
}