// import {Car} from "c:/Users/airumio/Desktop/toonmark-tutorial/src/types/test";
import {Car, test} from "./test";


const {a : hello, b : bello, c : cello} : {a : string, b : number, c : Car} = {
    a : "first",
    b : 1,
    c : {age : 10, name : 'name'}
};

console.log(cello.age);
console.log(test);

// const {a, b} : {a : string, b : number} = {a : "a", b : 1};
// console.log(a);