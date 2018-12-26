'use strict';

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
    generateRandomPinCode
};
