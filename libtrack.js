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



libtrack.listen(4000, () => {
    console.log("You are running on port 3000");
});
