import { AddAndMullable } from './__add__and__mul__.js';

export class Complex extends AddAndMullable {
    constructor(real, imag) {
        super();
        this.real = real;
        this.imag = imag;
    }

    __add__(other) {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }

    __mul__(other) {
        return new Complex(this.real * other.real - this.imag * other.imag,
                           this.real * other.imag + this.imag * other.real);
    }
}
