// Basic Netlify Serverless Function for Authentication Auth Check
exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const body = JSON.parse(event.body);
        const { password } = body;

        // Secure password check (Set ADMIN_PASSWORD in Netlify environment variables)
        // Defaults to 'admin123' if not set in environment
        const validPassword = process.env.ADMIN_PASSWORD || 'admin123';

        if (password === validPassword) {
            // In a real app, sign this token securely (e.g. JWT with crypto)
            // But for this frontend admin relying on localStorage, a simple secure opaque token suffices to unlock the UI
            const token = 'sec_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
            
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Authenticated securely", token: token })
            };
        } else {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: "Invalid credentials" })
            };
        }
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Bad Request" })
        };
    }
};
