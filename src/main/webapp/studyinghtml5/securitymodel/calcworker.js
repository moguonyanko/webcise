const sum = values => values.reduce((a, b) => a + b, 0);

self.onmessage = evt => {
    const values = evt.data.values;
    const result = sum(values);
    self.postMessage({ result });
};
