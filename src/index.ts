const tf = require('@tensorflow/tfjs-node');

// Class for inputs to models
class ModelInput {
    input: any;

    constructor(input: any) {
        this.input = input;
    }
}

// Class for outputs from models
class ModelOutput {
    output: any;

    constructor(output: any) {
        this.output = output;
    }
}

// Class for predicting text
class TextPredictor {
    model: TextPredictionModel;

    constructor(model: TextPredictionModel) {
        this.model = model;
    }

    // Method for predicting a word based on all tokens before it
    async predict(input: ModelInput) {
        // Tokenize the input
        const inputTokens = new BephenTokenizer().tokenize(input.input);

        // Convert tokens to tensors
        const inputTensor = tf.tensor2d([inputTokens.map(token => parseFloat(token))]);

        // Predict using the model
        const outputTensor = this.model.predict(inputTensor);

        // Convert output tensor to tokens
        const predictedTokens = Array.from(outputTensor.dataSync()).map(token => token.toFixed(0));

        // Untokenize and return the predicted word
        const predictedWord = new BephenTokenizer().untokenize(predictedTokens);

        return predictedWord;
    }
}

// Class for text datasets
class TextDataset {
    data: string = '';

    // Method for loading data to the dataset
    load(type: string, content: string) {
        if (type === 'plaintext') {
            this.data = content;
        }
    }
}

// Class for text prediction
class TextPredictionModel {
    model: tf.LayersModel;

    constructor() {
        // Create a simple RNN model
        this.model = tf.sequential();
        this.model.add(tf.layers.simpleRNN({ units: 128, inputShape: [null, 1], returnSequences: true }));
        this.model.add(tf.layers.dense({ units: 66, activation: 'softmax' }));
        this.model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });
    }

    // Method for getting the predictor for the model
    createPredictor() {
        return new TextPredictor(this);
    }

    // Method for training a model
    async train(dataset: TextDataset) {
        let data = dataset.data;

        // Tokenize the data
        const tokenizedData = new BephenTokenizer().tokenize(data);

        // Create sequences for training (sliding windows)
        const sequenceLength = 10;
        const sequences = [];
        for (let i = 0; i < tokenizedData.length - sequenceLength; i++) {
            sequences.push(tokenizedData.slice(i, i + sequenceLength));
        }

        // Prepare training data and labels
        const xData = sequences.slice(0, -1);
        const yData = sequences.slice(1);

        const x = tf.tensor(xData.map(seq => seq.map(token => parseFloat(token))));
        const y = tf.tensor(yData.map(seq => seq.map(token => parseFloat(token))));

        // Train the model
        await this.model.fit(x, y, { epochs: 50, batchSize: 64 });
    }

    // Predict method for the model
    predict(inputTensor: tf.Tensor): tf.Tensor {
        return this.model.predict(inputTensor);
    }
}

// Class for tokenization
class BephenTokenizer {
    // Method to tokenize a string into an array of tokens
    tokenize(input: string): string[] {
        // Define a mapping of characters to tokens for printable ASCII characters
        const characterToToken: { [key: string]: string } = {};

        // Define the printable ASCII characters range (32 to 126)
        const tokenCount = 126 - 32 + 1;

        for (let i = 32; i <= 126; i++) {
            const char = String.fromCharCode(i);
            characterToToken[char] = (i - 32).toString().padStart(2, '0');
        }

        // Split the input string into individual characters
        const characters = input.split('');

        // Initialize an array to store the tokens
        const tokens: string[] = [];

        // Loop through each character and add its corresponding token
        for (const char of characters) {
            const token = characterToToken[char] || ''; // Use an empty string for unknown characters
            tokens.push(token);
        }

        return tokens;
    }

    // Method to untokenize an array of tokens into a string
    untokenize(tokens: string[]): string {
        // Define the reverse mapping of tokens to characters for printable ASCII characters
        const tokenToCharacter: { [key: string]: string } = {};

        // Define the printable ASCII characters range (32 to 126)
        const tokenCount = 126 - 32 + 1;

        for (let i = 32; i <= 126; i++) {
            const char = String.fromCharCode(i);
            tokenToCharacter[(i - 32).toString().padStart(2, '0')] = char;
        }

        // Map tokens back to characters and join them to form a string
        const output = tokens.map(token => tokenToCharacter[token] || '').join('');

        return output;
    }
}

// Usage example
const dataset = new TextDataset();
dataset.load('plaintext', 'This is a sample text dataset.');

const model = new TextPredictionModel();

// Train the model
model.train(dataset).then(async () => {
    const predictor = model.createPredictor();
    const input = new ModelInput('Predict the next word based on this text.');
    const prediction = await predictor.predict(input);

    console.log('Predicted Word:', prediction);
});