export type PlayOptions = {
    time
}
export class Skeleton {
    readonly am: AssetManager;
    readonly sprites : Array<any> = [];

    constructor(am: AssetManager) {
        this.am = am;
    }
    public play(animationName: string) : Promise<boolean> {
        return true;
    }
    public async setHead(headName: string) : Promise<boolean> {
        const head = await this.am.getHead(headName);
        if(!head) return false;
        return true;
    }
    public async setBody(bodyName: string) : Promise<boolean> {
        const body = await this.am.getBody(bodyName);
        if(!body) return false;
        return true;
    }
    public async setWeapon(weaponName: string) : Promise<boolean> {

        return true;
    }
}


export type AssetLookup = {[id: string]: string };

export type AllAssetLookup = {
    heads: AssetLookup,
    bodies: AssetLookup,
    images: AssetLookup,
    hats: AssetLookup,
    weapons: AssetLookup,
    animations: AssetLookup,
}


export class AssetManager {
    readonly baseUrl: string;
    readonly loadedAssets: AllAssetLookup = { heads: {}, bodies: {}, images: {}, hats: {}, weapons: {}, animations: {} }


    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }


    private async getIndexedDbItem(key: string) : Promise<string> {
        return "";
    }
    private async getServerItem(key: string) : Promise<string> {
        return "";
    }

    public async getHead(id: string) : Promise<string> {
        return this.getAsset('heads', id);
    }
    public async getBody(id: string) : Promise<string> {
        return this.getAsset('bodies', id);
    }
    public async getHat(id: string) : Promise<string> {
        return this.getAsset('hats', id);
    }
    public async getWeapon(id: string) : Promise<string> {
        return this.getAsset('weapons', id);
    }
    public async getAnimation(id: string) : Promise<string> {
        return this.getAsset('animations', id);
    }
    public async getImage(id: string) : Promise<string> {
        return this.getAsset('images', id);
    }


    private async getAsset(type: keyof AllAssetLookup, id: string) : Promise<string> {
        if(id in this.loadedAssets[type]) {
            return this.loadedAssets[type][id];
        }
        const indexDbItem = await this.getIndexedDbItem(`${type}/${id}`);
        if(indexDbItem) {
            this.loadedAssets[type][id] = indexDbItem;
            return indexDbItem;
        }
        const serverItem = await this.getServerItem(`${type}/${id}`);
        if(serverItem) {
            this.loadedAssets[type][id] = serverItem;
            return serverItem;
        }
        return null;
    }
}