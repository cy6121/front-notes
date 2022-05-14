function Student(name) {
    this.name = name;
}

function Person(name) {
    this.name = name;
    return NaN;
}

Student.prototype.Hello = function () {
    console.log('Student: ', this.name);
}

Person.prototype.Hello = function () {
    console.log('Person: ', this.name);
}

const p = new Person('John');
p.__proto__ = Student.prototype;

p.Hello();
console.log(p);