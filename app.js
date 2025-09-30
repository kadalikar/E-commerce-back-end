const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");

// Start Express APP
const app = express();
app.enable("trust proxy");

// ---------------- Global Middlewares ---------------- //

// 1. CORS
app.use(cors());
// app.options(/.*/, cors()); // handle preflight for all routes

// 2. Serving static files
app.use(express.static(`${__dirname}/public`));

// 3. Set security HTTP headers
app.use(helmet());

// 4. Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 5. Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again later",
});
app.use("/api", limiter);

// 6. Body parser, cookie parser
app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// 7. Data sanitization
app.use(mongoSanitize());
app.use(xss());

// 8. Prevent parameter pollution
app.use(hpp());

// 9. Compression
app.use(compression());

// 10. Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ---------------- ROUTES ---------------- //

// Example routes (uncomment when routers are ready)
// app.use('/api/v1/products', productRouter);
// app.use('/api/v1/users', userRouter);

app.all("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// Global error handler (when ready)
// app.use(globalErrorHandler);

module.exports = app;
