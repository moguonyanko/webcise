// moduleで読み込まれたスクリプトは自動的にstrictモードになる。

class User {
    constructor({name, age}) {
        this.name = name;
        this.age = age;
    }
    
    get grownUp() {
        return this.age >= 20;
    }
    
    toString() {
        const txt =  `${this.name} is ${this.age} years old. `;
        const tmp = this.grownUp ? "Grown-up." : "Not grown-up.";
        return txt + tmp;
    }
}

export default User;
