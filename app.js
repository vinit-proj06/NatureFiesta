const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const productRoute = require('./routes/productRoutes');
const userRoute = require('./routes/userRoutes');
const reviewRoute = require('./routes/reviewRoutes');
const viewRoute = require('./routes/viewRoutes');
const paymentRoute = require('./routes/paymentRoute');
require('./cron/cronJobs');

const AppError = require('./utils/appError');
const { globalErrorHandler } = require('./controllers/errorController');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

// GLOBAL Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://cdnjs.cloudflare.com',
        'https://checkout.razorpay.com',
      ],
      frameSrc: ["'self'", 'https://api.razorpay.com'],
      connectSrc: ["'self'", 'ws://127.0.0.1:*', 'ws://localhost:*'],
    },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes
app.use('/', viewRoute);
app.use('/api/users', userRoute); // Ensure user routes are unprotected
app.use('/api/products', productRoute);
app.use('/api/orders', paymentRoute);
app.use('/api/review', reviewRoute);
app.use('/', paymentRoute);

app.get('/test', (req, res) => {
  res.send('Server is running!');
});

app.all('*', (req, res, next) => {
  console.log('404 handler triggered:', {
    url: req.originalUrl,
    method: req.method,
    headers: req.headers,
    user: req.user?._id || 'none',
  });
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
