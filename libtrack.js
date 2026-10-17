const express = require('express')
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
                res.render('admin-dashboard');
            } else {
                res.send(`<script>
                    alert('Invalid username or password');
                    location.href='/login'
                    </script>`);
                console.log("Invalid login attempt");
            }
        }
    );
});

libtrack.get('/admin-reg', (req, res) => {
    res.render('admin-reg');
});

libtrack.post('/admin-reg', (req, res) => {

    const univ = req.body.univ;
    const ln = req.body.ln;
    const fn = req.body.fn;
    const user = req.body.user;
    const pass = req.body.pass;

    console.log("University:", univ);
    console.log("Lastname:", ln);
    console.log("Firstname:", fn);
    console.log("Username:", user);
    console.log("Password:", pass);


    const libtrack_DB = `INSERT INTO user_acc (university, firstname, lastname, username, password) VALUES (?, ?, ?, ?, ?)`;
    conn.query(libtrack_DB, [univ, fn, ln, user, pass], () => {
        console.log("INSERT SUCCESS");
        res.send(`<script> alert('Registered Successfully!');
                    location.href='/admin-reg'
                </script>`);
    });
});


libtrack.get('/admin-dashboard', (req, res) => {
    res.render('admin-dashboard');
});


libtrack.listen(4500, () => {
    console.log("You are running on port 4500");
});
