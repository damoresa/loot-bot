'use strict';

const generateHuntCode = () => {
    // https://gist.github.com/gordonbrander/2230317
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

const generateRandomPinCode = (length) => {
    // We generate a random number that fulfil 1 ≤ x < 10.
    // Then, we multiply by Math.pow(10, length - 1) (number with a length).
    // Finally, parseInt() to remove decimals.
    const randomNumber = parseInt((Math.random() * 9 + 1) * Math.pow(10, length - 1), 10);

    // Generate the pad by the given length
    const pad = '0'.repeat(10);
    return pad.substring(0, pad.length - randomNumber.length) + randomNumber;
};

module.exports = {
    generateHuntCode,
    generateRandomPinCode,
};
