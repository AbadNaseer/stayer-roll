const express = require('express');
const app = express();
const port = 5000;
const nodemailer = require('nodemailer');
require('dotenv').config(); // for environment variables
const session = require('express-session');




// Set EJS as the templating engine
app.set('view engine', 'ejs');
// Serve static files from 'public' directory
app.use(express.static('public'));
// In your Express route handler
app.use(express.urlencoded({ extended: true }));

// Set up session middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a secure random key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to set default title
app.use((req, res, next) => {
    res.locals.title = 'نور تفصیل ستائر و مجالس'; // Set a default title
    next();
});

// Home Route
app.get('/', (req, res) => {
    res.locals.title = 'نور تفصیل ستائر و مجالس';
    res.render('home', { currentPage: 'home' });
});

// About Route
app.get('/about', (req, res) => {
    res.locals.title = 'معلومات عنا';
    res.render('about', { currentPage: 'about' });
});

// Services Route
app.get('/services', (req, res) => {
    res.locals.title = 'خدمات';
    res.render('services', { currentPage: 'services' });
});

// Contact Route
app.get('/contact', (req, res) => {
    res.locals.title = 'اتصل بنا';
    res.render('contact', { currentPage: 'contact' });
});


// Route to handle form submission
app.post('/submit-form', (req, res) => {
    const { name, email, phone, message } = req.body;

    // Regular expression for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regular expression for phone number validation (adjust as needed)
    const phoneRegex = /^(?:\+966|0)(\d{9})$/;

    // Validate email
    if (!emailRegex.test(email)) {
        return res.status(400).send('البريد الإلكتروني غير صالح.');
    }

    // Validate phone number
    if (!phoneRegex.test(phone)) {
        return res.status(400).send('رقم الهاتف غير صالح. يجب أن يبدأ برمز البلد +966 ويتبعه 9 أرقام.');
    }

    // Create transporter for email
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS, // Your email password
        },
    });

    // Email message details with HTML format
    let mailOptions = {
        from: email, // Sender's email
        to: process.env.EMAIL_USER, // Owner's email
        subject: 'Form Submission',
        html: `
            <h2>New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px;">Field</th>
                    <th style="border: 1px solid #ddd; padding: 8px;">Details</th>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">الاسم</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${name}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">البريد الإلكتروني</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${email}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">رقم الهاتف</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${phone}</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">الرسالة</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${message}</td>
                </tr>
            </table>
        `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).send('حدث خطأ أثناء إرسال رسالتك.');
        }

        // Redirect to success page after sending email
        req.session.emailSent = true; // Set session variable

        setTimeout(() => {
            req.session.emailSent = false; // Clear the session variable
        }, 10000); // 10000 milliseconds = 10 seconds


        res.redirect('/success');
    });
});


// Successfully Send Email
app.get('/success', (req, res) => {
    if (!req.session.emailSent) {
        // If email wasn't sent, redirect to home or another page
        return res.redirect('/');
    }

    // If email was sent, render the success page
    res.render('success');
    // Clear the session variable
    req.session.emailSent = null; // or delete req.session.emailSent;
});

// Page Not Found 
// Catch-all 404 route
app.use((req, res, next) => {
    res.status(404).render('404'); // Render the 404.ejs file
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
