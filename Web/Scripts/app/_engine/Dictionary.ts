export class Dictionary<T> {
    private values: { [key: string]: T; } = {};

    public get(key: string): T {
        return this.values[key];        
    }

    public contains(key: string): boolean {
        return key in this.values;
    }

    public remove(key: string) {
        delete this.values[key];
    }

    public set(key: string, value: T) {
        this.values[key] = value;
    }

    public getAll(): { [key: string]: T; } {
        return this.values;
    }

    public getSet(key: string, valueGetter: () => T): T;
    public getSet(key: string, value: T): T;
    public getSet(key: string, valueOrvalueGetter: any): T {
        if (!this.contains(key)) {
            this.set(key, typeof valueOrvalueGetter == 'function' ? valueOrvalueGetter() : valueOrvalueGetter);
        }
        return this.get(key);
    }
}
