// This is a helper class to help store key-value data inside
// an individual Storage object's key. 
// It simply performs the JSON parsing and stringifying steps

export class Storage {
    storage;
    name;

    /**
     * @param {string} name 
     * @param {Storage.prototype} storage 
     */
    constructor(storage, name) {
        if (!storage?.__proto__ === Storage.prototype) {
            throw new Error("storage should implment Storage")
        }
        this.storage = storage;
        this.name = name;
        const stored = this.storage.getItem(name);
        if (!stored) {
            this.storage.setItem(name, "{}")
        }
    }

    #getArea() {
        const area = JSON.parse(this.storage.getItem(this.name));
        return area;
    }

    set(key, value) {
        const area = this.#getArea();
        area[key] = value;
        this.storage.setItem(this.name, JSON.stringify(area))
    }

    get(key) {
        if (!key) {
            return this.#getArea();
        }
        const area = this.#getArea();
        return area[key];
    }
}