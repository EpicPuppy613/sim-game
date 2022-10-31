let canvas = <HTMLCanvasElement> document.getElementById('game');
let ctx = canvas.getContext('2d');

export type Game = {
    width: number,
    height: number,
    mods: Mod[],
    modlist: string[],
    modqueue: Mod[]
};

let G: Game = {
    width: 0,
    height: 0,
    mods: [],
    modlist: [],
    modqueue: []
};

class SemVer {
    major: number;
    minor: number;
    patch: number;
    pre: string | null;

    constructor (major: number, minor: number, patch: number, pre?: string) {
        this.major = major;
        this.minor = minor;
        this.patch = patch;
        this.pre = pre !== undefined ? pre : null;
    }

    toString (): string {
        var out = `${this.major}.${this.minor}.${this.patch}`;
        out += this.pre !== null ? `-${this.pre}` : "";
        return out;
    }

    fromString (string: string): SemVer {
        if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/
        .test(string)) throw new EvalError("String is not a valid SemVer");
        var split = string.split('-');
        var pre = split.slice(1);
        var verstring = split[0];
        var version = verstring.split('.');
        return 
    }

    gte (compare: SemVer): boolean {
        if (this.major > compare.major) return true;
        if (this.major < compare.major) return false;
        if (this.minor > compare.minor) return true;
        if (this.minor < compare.minor) return false;
        if (this.patch > compare.patch) return true;
        if (this.patch < compare.patch) return false;
        if (this.pre === null && compare.pre !== null) return true;
        if (this.pre !== null && compare.pre === null) return false;
        if (this.pre >= compare.pre) return true;
        return false;
    }

    lt (compare: SemVer): boolean {
        return !this.gte(compare);
    }
};

export function ver(string: string): SemVer {
    return SemVer.prototype.fromString(string);
};

type Dependency = {
    id: string,
    version: SemVer;
};

class Mod {
    id: string;
    name: string;
    version: SemVer;
    dependencies: Dependency[];

    constructor (id: string, name: string, version: SemVer, dependencies: Dependency[]) {
        this.id = id;
        this.name = name;
        this.version = version;
        this.dependencies = dependencies;
    }

    checkDependencies (mods: Mod[]) {
        if (this.dependencies.length == 0) return true;
        for (const dependency of this.dependencies) {
            var satisfied = false;
            for (const mod of mods) {
                if (mod.id == dependency.id && dependency.version.gte(mod.version)) satisfied = true;
            }
            if (!satisfied) return false;
        }
        return true;
    }
};

/**
 * 
 */
class EventBus {

};

async function init(mods: string[]) {
    G.width = window.innerWidth;
    G.height = window.innerHeight;
    canvas.width = G.width;
    canvas.height = G.height;
    for (const mod of mods) {
        await import(mod);
    }
};

export function registerMod(mod: Mod) {
    var modsToLoad = G.modqueue;
    modsToLoad.push(mod);
    G.modqueue = [];
    while (modsToLoad.length > 0) {
        if (modsToLoad[0].checkDependencies(G.mods)) {
            G.mods.push(modsToLoad[0]);
            G.modlist.push(modsToLoad[0].id);
            modsToLoad = modsToLoad.slice(1);
            modsToLoad = modsToLoad.concat(G.modqueue);
            G.modqueue = [];
        } else {
            G.modqueue.push(mod);
        }
        modsToLoad = modsToLoad.slice(1);
    }
}