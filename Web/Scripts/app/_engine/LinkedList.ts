export class LinkedList<T>{

    private first: LinkedListNode<T> = null;
    private last: LinkedListNode<T> = null;
    private length: number = 0;

    public get First(): LinkedListNode<T> {
        return this.first;
    }
    public set First(node: LinkedListNode<T>) {
        this.first = node;
    }

    public get Last(): LinkedListNode<T> {
        return this.last;
    }
    public set Last(node: LinkedListNode<T>) {
        this.last = node;
    }

    public get Length(): number {
        return this.length;
    }

    public AddNode = (data: T): LinkedListNode<T> => {
        var node = new LinkedListNode<T>();
        node.data = data;
        node.previous = node.next = null;
        node.list = this;
        if (!this.first) {
            this.first = node;
            this.last = node;
        } else {
            this.last.next = node;
            node.previous = this.last;
            this.last = node;
        }
        this.length++;
        return node;
    }

    public InsertNode = (data: T): LinkedListNode<T> => {
        var node = new LinkedListNode<T>();
        node.data = data;
        node.previous = node.next = null;
        node.list = this;
        if (!this.first) {
            this.first = node;
            this.last = node;
        } else {
            this.first.next.previous = node;
            node.previous = this.first.next;
            this.first = node;
        }
        this.length++;
        return node;
    }

    public RemoveNode(node: LinkedListNode<T>) {
        if (node.previous) node.previous = node.next;
        if (node.next) node.next.previous = node.previous;
        this.length--;
    }

    public RollLeft() {
        var last = this.first;
        var second = this.first.next;
        last.next = null;
        last.previous = this.last;
        this.last.next = last;
        this.last = last;

        this.first = second;
        this.first.previous = null;
    }

    public forEach(callback: (node: LinkedListNode<T>) => void) {
        var node = this.first;
        while (node) {
            callback(node);
            node = node.next;
        }
    }
}

export class LinkedListNode<T>{
    public previous : LinkedListNode<T>;
    public next : LinkedListNode<T>;
    public data: T;
    public list: LinkedList<T>;

    public InsertBefore(data: T) {
        var node = this.list.AddNode(data);
        var previous = this.previous;
        node.next = this;
        node.previous = previous;
        this.previous = node;
        if (previous) {
            previous.next = node;
        }  
        node.list = this.list;   
        this.list.First = this.FindFirst();   
    }

    public InsertAfter(data: T) {
        var node = this.list.AddNode(data);
        var next = this.next;
        node.previous = this;
        node.next = next;
        this.next = node;
        if (next) {
            next.previous = node;
        }
        node.list = this.list;
        this.list.Last = this.FindLast();
    }

    public FindFirst(): LinkedListNode<T> {
        var node: LinkedListNode<T> = this;
        while (node.previous) { node = node.previous; }
        return node;
    }

    public FindLast(): LinkedListNode<T> {
        var node: LinkedListNode<T> = this;
        while (node.next) { node = node.next; }
        return node;
    }
}