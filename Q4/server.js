const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.urlencoded({ extended: true }));

// Connect to the PostgreSQL container
const pool = new Pool({
    user: 'admin',
    host: 'db',
    database: 'searchdb',
    password: 'admin',
    port: 5432,
});

// BACKEND VALIDATION (Req 3, 6)
const validateInput = (input) => {
    // Check length (min 1, max 50)
    if (!input || input.length < 1 || input.length > 50) return false;
    
    // Check for SQLi/XSS attack characters: < > ' " ; -
    if (/[<>'";\-]/.test(input)) return false;
    
    return true;
};

// HOME PAGE (Req 1, 2, 5, 7)
app.get('/', (req, res) => {
    res.send(`
        <form action="/search" method="POST" onsubmit="return validateForm()">
            <input type="text" id="term" name="term" required>
            <button type="submit">Search</button>
        </form>
        
        <!-- FRONTEND VALIDATION -->
        <script>
            function validateForm() {
                const val = document.getElementById('term').value;
                // Block attacks and check length
                if (val.length < 1 || val.length > 50 || /[<>'";\\-]/.test(val)) {
                    alert('Attack detected or invalid length!');
                    document.getElementById('term').value = ''; // Clear input (Req 7)
                    return false; // Prevent form submission
                }
                return true;
            }
        </script>
    `);
});

// SEARCH RESULTS PAGE (Req 8, 9)
app.post('/search', async (req, res) => {
    const term = req.body.term;
    
    // If backend detects an attack, redirect to home page and clear (Req 7)
    if (!validateInput(term)) {
        return res.redirect('/'); 
    }
    
    try {
        // Log query to database (query_time is handled automatically by PostgreSQL)
        await pool.query('INSERT INTO "2400689" (query) VALUES ($1)', [term]);
        
        // Display result and return button (Req 8)
        res.send(`
            <p>Search Term: ${term}</p>
            <button onclick="window.location.href='/'">Return Home</button>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error");
    }
});

app.listen(8080, () => console.log('Server running on port 8080'));