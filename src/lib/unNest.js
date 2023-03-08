export default function unNest(records) {
    let results = [];
    for (const record of records) {
        for (const state in record) {
            for (const county in record[state]) {
                for (const party in record[state][county]) {
                    for (const candidate in record[state][county][party]) {
                        results.push({
                            state,
                            county,
                            party,
                            candidate,
                            votes: record[state][county][party][candidate],
                        });
                    }
                }
            }
        }
    }
    return results;
}
