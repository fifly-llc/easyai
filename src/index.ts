class ModelImput {
    imput: any;

    constructor(imput: any) {
        this.imput = imput;
    }
}

class ModelOutput {
    output: any;

    constructor(output: any) {
        this.output = output;
    }
}

class TextPredictionModel {
    constructor() {
        
    }

    predict(imput: ModelImput) {
        return new ModelOutput(this.predictFromBephenTokenized(BephenTokenizer.tokenize(imput.imput)));
    }

    predictFromBephenTokenized(imput: string[]) {
        let inputTokenized: string[][] = [];
        imput.forEach((element, index) => {
            for (let i: any; i < element.length; i++) {
                let token: string = element.charAt(i) + element.charAt(i + 1);
                inputTokenized[index][i] = token;
            }
        });
    }
}

class BephenTokenizer {
    static tokenize(imput: any) {
        if (typeof imput === 'string') {
            let splitImput = imput.split(' ');
            let tokenizedSplitImput: string[] = [];

            splitImput.forEach((element, index) => {
                tokenizedSplitImput[index] = element.replace('a', '00').replace('b', '01').replace('c', '02').replace('d', '03').replace('e', '04').replace('f', '05').replace('g', '06').replace('h', '07').replace('i', '08').replace('j', '09').replace('k', '10').replace('l', '11').replace('m', '12').replace('n', '13').replace('o', '14').replace('p', '15').replace('q', '16').replace('r', '17').replace('s', '18').replace('t', '19').replace('u', '20').replace('v', '21').replace('w', '22').replace('x', '23').replace('y', '24').replace('z', '25').replace('0', '26').replace('1', '27').replace('2', '28').replace('3', '29').replace('4', '30').replace('5', '31').replace('6', '32').replace('7', '33').replace('8', '34').replace('9', '35');
            });

            return tokenizedSplitImput;
        } else {
            throw new TokenizerTypeError("Invalid type passed for tokenization.");
        }
    }
}

class TokenizerTypeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TokenizerTypeError";
    }
}