encode = function(n, base_p, base_P) {
    base_p = BigInt(base_p);
    base_P = BigInt(base_P);
    return (base_p ** (base_P ** BigInt(n)));
}

decode = function(N, base_p, base_P) {
    base_p = BigInt(base_p);
    base_P = BigInt(base_P);

    let num_factors_p = 0n;
    let results = [];
    while (N > 0n) {
        let N_base_p;
        while ((N_base_p = N % base_p) === 0n) {
            num_factors_p += 1n;
            N /= base_p;
        }
        let base_repn = base_P_repn(num_factors_p, base_P);
        let repeated_mults = base_repn.map((n, idx) => Array(Number(n)).fill(idx)).flat();
        results.push(...Array(Number(N_base_p)).fill(repeated_mults));
        N -= N_base_p;
    }
    return results;
}

base_P_repn = function(N, P) {
    let repn = [];
    while (N > 0n) {
        repn.push(N % P);
        N /= P;
    }
    return repn;
}

const DEFAULT_p = 4;
const DEFAULT_P = 4;

export class AddAndMullable {
    static eval(bigN) {
        this._ensure_objs();

        const base_p = this.base_p || DEFAULT_p;
        const base_P = this.base_P || DEFAULT_P;
        const sumOfProducts = decode(bigN, base_p, base_P);
        return sumOfProducts
            .map(prod => prod.map(n => this._objs[n]).reduce((a, b) => a.__mul__(b)))
            .reduce((a, b) => a.__add__(b));
    }

    valueOf() {
        this.constructor._ensure_objs();
        const base_p = this.constructor.base_p || DEFAULT_p;
        const base_P = this.constructor.base_P || DEFAULT_P;

        const current_id = this.constructor._objs.length;
        this.constructor._objs.push(this);
        return encode(current_id, base_p, base_P);
    }

    static _ensure_objs() {
        if (typeof this._objs === 'undefined') {
            this._objs = [];
        }
    }
}
