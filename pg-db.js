const { Client } = require("pg");

let clientPromise = null;

function getPG() {
    if (!clientPromise) {
        clientPromise = (async () => {
            const client = new Client({
                connectionString: process.env.DATABASE_URL,
                ssl: {
                    rejectUnauthorized: false
                }
            });

            await client.connect();
            console.log("PostgreSQL connected.");
            return client;
        })();
    }

    return clientPromise;
}

module.exports = { getPG };
