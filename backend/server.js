/**
 * EduMaster REST API Server
 *
 * This server allows both Web and Android apps to share data
 *
 * Setup:
 * 1. npm install express body-parser cors sqlite3
 * 2. node server.js
 * 3. Server runs on http://localhost:3000
 */

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allow requests from web and Android
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database('./edumaster.db', (err) => {
    if (err) {
        console.error('Database error:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

// Create tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT,
            current_streak INTEGER DEFAULT 0,
            total_cards_studied INTEGER DEFAULT 0,
            accuracy REAL DEFAULT 0,
            level INTEGER DEFAULT 1,
            coins INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Cards table
        db.run(`CREATE TABLE IF NOT EXISTS cards (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            hint TEXT,
            category TEXT,
            interval INTEGER DEFAULT 1,
            ease_factor REAL DEFAULT 2.5,
            next_review DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Study sessions table
        db.run(`CREATE TABLE IF NOT EXISTS study_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            course_name TEXT,
            date TEXT,
            time TEXT,
            duration INTEGER,
            cards_reviewed INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);

        // Courses table
        db.run(`CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            icon TEXT,
            price INTEGER DEFAULT 0,
            rating REAL DEFAULT 0,
            total_ratings INTEGER DEFAULT 0,
            total_cards INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        console.log('✅ Database tables initialized');
    });
}

// ==================== API ENDPOINTS ====================

// Health check
app.get('/', (req, res) => {
    res.json({
        message: '🎓 EduMaster API Server',
        version: '1.0.0',
        status: 'running',
        endpoints: [
            'GET /api/cards - Get all cards',
            'POST /api/cards - Create new card',
            'GET /api/users/:id - Get user info',
            'POST /api/sync - Sync data from client',
        ]
    });
});

// Get all cards for a user
app.get('/api/cards', (req, res) => {
    const userId = req.query.userId || 1;

    db.all(
        'SELECT * FROM cards WHERE user_id = ? ORDER BY created_at DESC',
        [userId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({
                    success: true,
                    count: rows.length,
                    cards: rows
                });
            }
        }
    );
});

// Create a new card
app.post('/api/cards', (req, res) => {
    const { userId = 1, question, answer, hint, category } = req.body;

    if (!question || !answer) {
        return res.status(400).json({
            success: false,
            error: 'Question and answer are required'
        });
    }

    db.run(
        `INSERT INTO cards (user_id, question, answer, hint, category, next_review)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [userId, question, answer, hint || '', category || 'general'],
        function(err) {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.json({
                    success: true,
                    message: 'Card created successfully',
                    cardId: this.lastID
                });
            }
        }
    );
});

// Update card (for spaced repetition)
app.put('/api/cards/:id', (req, res) => {
    const { id } = req.params;
    const { interval, easeFactor, nextReview } = req.body;

    db.run(
        `UPDATE cards
         SET interval = ?, ease_factor = ?, next_review = ?
         WHERE id = ?`,
        [interval, easeFactor, nextReview, id],
        (err) => {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.json({
                    success: true,
                    message: 'Card updated successfully'
                });
            }
        }
    );
});

// Get user stats
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else if (!row) {
            // Create default user if doesn't exist
            db.run(
                `INSERT INTO users (id, username, current_streak, total_cards_studied, accuracy, level, coins)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [id, `user${id}`, 7, 248, 85.0, 12, 2450],
                function(err) {
                    if (err) {
                        res.status(500).json({ success: false, error: err.message });
                    } else {
                        res.json({
                            success: true,
                            user: {
                                id: id,
                                username: `user${id}`,
                                current_streak: 7,
                                total_cards_studied: 248,
                                accuracy: 85.0,
                                level: 12,
                                coins: 2450
                            }
                        });
                    }
                }
            );
        } else {
            res.json({
                success: true,
                user: row
            });
        }
    });
});

// Sync data from client (bulk upload)
app.post('/api/sync', (req, res) => {
    const { userId = 1, cards, sessions } = req.body;

    let uploaded = 0;

    // Insert cards
    if (cards && Array.isArray(cards)) {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO cards (user_id, question, answer, hint, category, interval, ease_factor, next_review)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        cards.forEach(card => {
            stmt.run(
                userId,
                card.question,
                card.answer,
                card.hint || '',
                card.category || 'general',
                card.interval || 1,
                card.easeFactor || 2.5,
                card.nextReview || new Date().toISOString()
            );
            uploaded++;
        });

        stmt.finalize();
    }

    res.json({
        success: true,
        message: 'Data synced successfully',
        uploaded: uploaded
    });
});

// Get all courses
app.get('/api/courses', (req, res) => {
    db.all('SELECT * FROM courses ORDER BY rating DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ success: false, error: err.message });
        } else {
            res.json({
                success: true,
                count: rows.length,
                courses: rows
            });
        }
    });
});

// Get study sessions
app.get('/api/sessions', (req, res) => {
    const userId = req.query.userId || 1;

    db.all(
        'SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date DESC, time DESC LIMIT 10',
        [userId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ success: false, error: err.message });
            } else {
                res.json({
                    success: true,
                    sessions: rows
                });
            }
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🎓 EduMaster API Server Running!      ║
╠══════════════════════════════════════════╣
║   Port: ${PORT}                          ║
║   URL: http://localhost:${PORT}          ║
║                                          ║
║   Test it:                               ║
║   curl http://localhost:${PORT}          ║
╚══════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('\n✅ Database connection closed');
        }
        process.exit(0);
    });
});
