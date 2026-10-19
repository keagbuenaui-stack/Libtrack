const express = require('express');
const libtrack = express();

libtrack.set('view engine', 'ejs');
libtrack.use(express.static('public'));
libtrack.use(express.urlencoded({ extended: true }));

const conn = require('./conn.js');

libtrack.get('/', (req, res) => {
    res.render('landing-page');
});

libtrack.get('/login', (req, res) => {
    res.render('login');
});

// ========= FOR LOGIN LOGIC =========
libtrack.post('/login', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    conn.query(
        "SELECT * FROM user_acc WHERE username = ? AND password = ?",
        [username, password],
        (err, results) => {
            if (err) {
                return res.send("Database error");
            }

            if (results.length > 0) {
                console.log("SUCCESSFULLY LOGGED IN!");
                res.redirect('/admin-dashboard');
            } else {
                res.send(`<script>
                    alert('Invalid username or password');
                    location.href='/login';
                </script>`);
                console.log("Invalid login attempt");
            }
        }
    );
});


libtrack.get('/admin-reg', (req, res) => {
    res.render('admin-reg');
});

// ========= FOR ADMIN REGISTRATION =========
libtrack.post('/admin-reg', (req, res) => {
    const univ = req.body.univ;
    const ln = req.body.ln;
    const fn = req.body.fn;
    const user = req.body.user;
    const pass = req.body.pass;

    const sql = `
        INSERT INTO user_acc
        (university, firstname, lastname, username, password)
        VALUES (?, ?, ?, ?, ?)
    `;

    conn.query(sql, [univ, fn, ln, user, pass], (err) => {
        if (err) {
            return res.send("Registration failed");
        }

        console.log("INSERT SUCCESS");
        res.send(`<script>
            alert('Registered Successfully!');
            location.href='/login';
        </script>`);
    });
});

// ========= ADMIN DASHBOARD =========
libtrack.get('/admin-dashboard', (req, res) => {
    conn.query('SELECT * FROM courses', (err, courses) => {
        if (err) { console.log(err); return res.send("Database error"); }

        conn.query('SELECT * FROM students', (err, students) => {
            if (err) { console.log(err); return res.send("Database error"); }

            res.render('admin-dashboard', {
                courses: courses,
                students: students
            });
        });
    });
});

// ========= FOR ADDING STUDENT visits =========
libtrack.post('/add-student', (req, res) => {
    const school_id = req.body.school_id;
    const fullname = req.body.fullname;
    const course_id = req.body.course_id;
    const year_level = req.body.year_level;

    const sql = `
        INSERT INTO students
        (school_id, fullname, course_id, year_level)
        VALUES (?, ?, ?, ?)
    `;

    conn.query(
        sql,
        [school_id, fullname, course_id, year_level],
        (err) => {
            if (err) {
                console.log(err);
                return res.send("Unable to add student. Please check the information.");
            }

            res.send(`<script>
                alert('Student added successfully!');
                location.href='/admin-dashboard';
            </script>`);
        }
    );
});

// ========= VISIT STATISTICS =========
libtrack.get('/statistics', (req, res) => {


    const weekly = `
        SELECT DATE_FORMAT(MIN(visit_date), '%b %e') AS label, COUNT(*) AS total
        FROM visits
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
        GROUP BY YEARWEEK(visit_date, 1)
        ORDER BY YEARWEEK(visit_date, 1)
    `;

    // Visits per month (last 6 months)
    const monthly = `
        SELECT DATE_FORMAT(visit_date, '%b %Y') AS label, COUNT(*) AS total
        FROM visits
        WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY YEAR(visit_date), MONTH(visit_date), label
        ORDER BY YEAR(visit_date), MONTH(visit_date)
    `;

    // Total visits per course
    const course = `
        SELECT c.course_name AS label, COUNT(v.visit_id) AS total
        FROM visits v
        JOIN students s ON v.school_id = s.school_id
        JOIN courses c ON s.course_id = c.course_id
        GROUP BY c.course_id, c.course_name
        ORDER BY total DESC
    `;

    conn.query(weekly, (err, weekly) => {
        if (err) return res.send("Database error");

        conn.query(monthly, (err, monthly) => {
            if (err) return res.send("Database error");

            conn.query(course, (err, courseVisits) => {
                if (err) return res.send("Database error");

                res.render('statistics', {
                    weekly: weekly,
                    monthly: monthly,
                    courseVisits: courseVisits
                });
            });
        });
    });
});

//========== LOGOUT =========
libtrack.get('/logout', (req, res) => {
    console.log("ADMIN LOGGED OUT!");
    res.redirect('/login');
});

libtrack.listen(4500, () => {
    console.log("You are running on port 4500");
});