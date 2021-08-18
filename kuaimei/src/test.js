/*
 * @Author: DWP
 * @Date: 2021-04-27 13:09:17
 * @LastEditors: DWP
 * @LastEditTime: 2021-05-14 08:46:51
 */

class Stack {
  constructor() {
    this.mainStack = [];
    this.minStack = [];
  }

  push(element) {
    if (!this.minStack.length || element <= this.minStack[this.minStack.length - 1]) {
      this.minStack.push(element);
    }

    this.mainStack.push(element);
  }

  pop() {
    if (this.minStack[this.minStack.length - 1] === this.mainStack[this.mainStack.length - 1]) {
      this.minStack.pop();
    }

    return this.mainStack.pop();
  }

  getMin() {
    if (!this.mainStack.length) return null;
    return this.minStack[this.minStack.length - 1];
  }
}

const a = new Stack();

a.push(4);
a.push(9);
a.push(7);
a.push(3);
a.push(8);
a.push(2);
console.log(a.getMin()); // 2
a.pop();
a.pop();
console.log(a.getMin()); // 3
a.push(6);
a.pop();
a.pop();
a.pop();
console.log(a.getMin()); // 4
