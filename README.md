# Python's `__add__` and `__mul__` in Javascript
## Executive summary

Extend the class `AddAndMullable` from `__add__and__mul__.js`, and then define `__add__(other) {...}` and `__mul__(other) {...}` functions. Then evaluate using the class's inherited `eval` method. For example:
```javascript
import { Complex } from './complex.js';
let c1 = new Complex(1, 1);
let c2 = new Complex(-2, 0);
let c3 = Complex.eval(c1 * c1 + c2); // Object { real: -2, imag: 2 }
```
This works by giving each class instance an id and then using `valueOf` to encode it as `p ** (p ** _id)`.

## Details

I want to be able to use Python's `__add__` and `__mul__` in Javascript! That is, I want to define an `__add__` and `__mul__` method on my Javascript class `Foo` and have those methods get called automatically when I evaluate `myFoo1 * myFoo2 + myFoo3`.

It is only a mild inconvenience that Javascript does not implement this syntactic sugar, but... can it be done?!

## Using `valueOf`

This task would be absolutely hopeless were it not for `valueOf`: we can define a function `Foo.prototype.valueOf`, and then `myFoo1 * myFoo2 + myFoo3` will get automatically evaluated as `myFoo1.valueOf() * myFoo2.valueOf() + myFoo3.valueOf()`. This is actually enough to get the job done! _(Although there are limitations.)_

## The implementation

The trick is to figure out how to encode unique class instances as numeric values in such a way that the inputs to an arbitrary sum of products of those numeric values can be uniquely recovered from the final result.

This is easier said than done. The encoded values cannot, for example, include the numbers 1, 2, and 3, because `1 + 2 + 3 = 1 * 2 * 3 = 6`, and so if some arithmetic expression involving three `Foo` instances resulted in the number `6`, then we would not be able to determine whether we should turn that into `a.__add__(b.__add__(c))` or `a.__mul__(b.__mul__(c))`.

The scheme I landed on is as follows:

* Choose some arbitrary positive integer `p`. (I'll explain momentarily how this matters.)
* Encode the integer `n` as `e(n) := p ** (p ** n)`
* To decode the result of some sum of products of numbers of the form `e(n)`: Decompose the result in base `p`. Each nonzero term in the decomposition corresponds to a summand. The power of `p` in each such term will itself be a power of `p`. Take the base `p` decomposition _again_ for each such term; the iterated decomposition will correspond to the multiplicands in each summand.

The value of `p` matters in that if the same summand or multiplicand appears at least `p` times within a term, it'll mess up the base `p` representation. So `p` needs to be large enough where one can feel confident that the result of a `valueOf` call will never be stored and used at least `p` times. Repeated calls to `valueOf` will produce new values, so one can avoid problems here by always doing `<Class>.eval(instance_1 * instance_1 * instance_1)` (good) rather than `let temp = +instance_1; let result = <Class>.eval(temp * temp * temp)` (bad).

# Disclaimers

**This is very much not suitable for production.** Besides the fact that the encodings are very large (double-exponential in the number of instances!), I haven't bothered to implement clean-up of instances after they are evaluated. In other words, the class prototype has to keep track of the `id -> instance` mapping and I don't bother ever cleaning that up, so this leaks memory like crazy.

**Limitations on `__add__` and `__mul__`:** These _must_ be associative, commutative, and the latter must distribute over the former. This is not as general as the Python equivalent, which allows you to do whatever you want. But because all the arithmetic is done with numeric values (BigInts, in particular), there is simply no way to distinguish `A * B` from `B * A`, etc. Additionally, the `other` argument to `__add__` and `__mul__` must again be an instance of the same class. Doing something like `Complex.eval(c1 * 3)` will not work. Subtraction will not work. Division will not work.
