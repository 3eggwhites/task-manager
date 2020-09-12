const { calculateTip, fahrenheitToCelsius, celsiusToFahrenheit, add } = require('../playground/math')

test('Should calculate total with tip', () => {
    const total = calculateTip(10, .3);

    expect(total).toBe(13);
});

test('Should calculate total with default', () => {
    const total = calculateTip(10);

    expect(total).toBe(11);
});

test('Should convert 32f to 0c', () => {
    const celcius = fahrenheitToCelsius(32);
    
    expect(celcius).toBe(0);
});

test('Should convert 0c to 32f', () => {
    const fahrenheit = celsiusToFahrenheit(0);

    expect(fahrenheit).toBe(32);
});

// test('Async test demo', (done) => {
//     setTimeout(() => {
//         expect(1).toBe(1);
//         done();
//     },2000);
// });

test('Should add two numbers', (done) => {
    add(2,3).then((sum) => {
        expect(sum).toBe(5);
        done();
    });
});

test('Should add two numbers async await', async () => {
    const sum = await add(2,3);
    expect(sum).toBe(5);
});