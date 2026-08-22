import 'dotenv/config';

async function runTests() {
    console.log("Starting verification...");
    
    // 1. Test Registration
    const registerRes = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "Test User",
            email: "testuser@example.com",
            password: "password123"
        })
    });
    const registerData = await registerRes.json();
    console.log("Registration:", registerData);

    // 2. Test Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: "testuser@example.com",
            password: "password123"
        })
    });
    const loginData = await loginRes.json();
    console.log("Login:", loginData);

    // Get cookie from login
    const cookies = loginRes.headers.get('set-cookie');
    let token = '';
    if (cookies) {
        const match = cookies.match(/token=([^;]+)/);
        if (match) token = match[1];
    }
    console.log("JWT generated:", !!token);

    // 3. Test Is-Auth (checks middleware)
    if (token) {
        const authRes = await fetch('http://localhost:5000/api/auth/is-auth', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Cookie': `token=${token}`
            }
        });
        const authData = await authRes.json();
        console.log("Is Authenticated (Middleware checks role/id):", authData);
    }
}

runTests().catch(console.error);
