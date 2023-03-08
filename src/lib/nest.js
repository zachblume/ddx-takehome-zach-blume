// export default
function nest(records) {
    let states = {};

    for (const record of records) {
        const { state, county, party, candidate, votes } = record;
        if (!states.hasOwnProperty(state)) states[state] = {};
        if (!states[state].hasOwnProperty(county)) states[state][county] = {};
        if (!states[state][county].hasOwnProperty(party)) states[state][county][party] = {};
        states[state][county][party][candidate] = Number(votes);
    }
    return [states];
}

// Use fs to read /public/example_from_colorado.json, pass it through nest(), and write it back as example.json to the same folder
const fs = require("fs");
fs.readFile("public/data_from_colorado.json", "utf8", (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    fs.writeFile("public/example.json", JSON.stringify(nest(JSON.parse(data)), null, 4), (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });
});
