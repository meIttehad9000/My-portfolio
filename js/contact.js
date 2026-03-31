exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const payload = JSON.parse(event.body);
        const { name, email, msg } = payload;

        // Basic spam check
        if (!name || !email || !msg) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
        }
        
        // Log to Netlify Server Logs (this fulfills "saves messages to logs")
        console.log("=== NEW CONTACT SUBMISSION ===");
        console.log(`Time: ${new Date().toISOString()}`);
        console.log(`Name: ${name}`);
        console.log(`Email: ${email}`);
        console.log(`Message: ${msg}`);
        console.log("==============================");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Success" })
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server Error" })
        };
    }
};
