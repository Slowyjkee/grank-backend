import express from 'express';
import bodyParser from 'body-parser';
import 'dotenv/config';
import productsRoute from './routes/productsRoute';
import usersRoute from './routes/usersRoute';
import categoriesRoute from './routes/categoryRoute';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ApiError from './utils/apiErrors';
import {errorController} from './controllers/errorController';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();


//RATE LIMITS OF REQS

const limiter = rateLimit({
    max:1000,
    windowMs:60 * 60 * 1000,
    message: 'Too mane reqs from this ip, please try again later'
});

app.use('/api', limiter);
app.use(helmet());
app.use(express.json({ limit : '10kb'}));


//AGAINST QUERY INJECTIONS
app.use(mongoSanitize());

app.use(cors({origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true}));
app.use(cookieParser());
app.use(xss());
app.use(hpp({whitelist:['duration']}));
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next) => next());
app.disable('etag');

//GLOBAL MIDDLEWARE


//ROUTES
app.use('/api/v1/products', productsRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/categories', categoriesRoute);

app.get('/',(req,res) => {res.send("Hello Babel")});



app.all('*', (req, res, next) => {
    next(new ApiError(`Route ${req.originalUrl} is not defined`, 404))
});

app.use(errorController);

export default app;
