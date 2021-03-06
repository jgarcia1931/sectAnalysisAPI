const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');
const cookieSession = require("cookie-session");
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const passportSetup = require('./config/passport-setup');
const passport = require('passport');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// const logger = require('./middleware/logger')

// load env vars
dotenv.config({path: './config/config.env'});

// Connect to database
connectDB();

// Route Files
const items = require('./routes/api/items');
const bootcamps = require('./routes/api/bootcamps');
const courses = require('./routes/api/courses');
const parts = require('./routes/api/parts');
const sectionProps = require('./routes/api/sectionProps');
const auth = require('./routes/api/auth');
const imm = require('./routes/api/immigration');

const app = express();

// Extended: https://swagger.io/specification/#infoObject
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'Section Analysis API',
            version: '1.0.0',
            description: 'Simple section analysis calculation',
            contact: {
                name: 'Jose Garcia'
            },
            servers: ["http://dev.somelitecoding.com"]
        }
    },
    apis: ["./routes/api/auth.js", "./routes/api/parts.js", "./routes/api/sectionProps.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Bodyparser Middleware
// app.use(bodyParser.json());
app.use(express.json());

// Cookie Parser
app.use(
    cookieSession({
        name: "session",
        keys: ["asdfkhjwlaer"],
        maxAge: 24 * 60 * 60 * 100
    })
);
app.use(cookieParser())

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Dev Logging Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet())

// Prevent XSS attacks
app.use(xss());

// Rate Limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,           // 10 mins
    max: 100
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/parts', parts);
app.use('/api/v1/sectionProps', sectionProps);
app.use('/api/v1/items', items);
app.use('/api/v1/auth', auth);

app.use('/api/v1/immigration', imm);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exist process
    server.close(() => process.exit(1));
})
