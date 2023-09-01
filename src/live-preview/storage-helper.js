export class Storage {
    storage;
    name;

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
        // console.log(value, typeof value)
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