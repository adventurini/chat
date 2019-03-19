import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import createServer from './createServer';

const app = express();
const server = createServer();

const corsOptions = {
  credentials: true,
  origin: process.env.FRONTEND_URL
};

app.use(cors(corsOptions));
// app.use(helmet());
app.use(cookieParser());

// app.use((req, res, next) => {
//   console.log(' : -----------');
//   console.log(' : index.req.cookies', req.cookies);
//   console.log(' : -----------');
//   const { token } = req.cookies;
//   console.log(' : ---------------');
//   console.log(' : index.token', token);
//   console.log(' : ---------------');
//   if (token) {
//     const user = jwt.verify(token, process.env.JWT_SECRET);
//     req.me = user;
//   }
//   next();
// });

// decode the JWT so we can get the user Id on each request
app.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    // put the userId onto the req for future requests to access
    req.userId = userId;
  }
  console.log('req.userId: ', req.userId);

  next();
});

// 2. Create a middleware that populates the user on each request
// app.use(async (req, res, next) => {
//   // if they aren't logged in, skip this
//   if (!req.userId) return next();
//   const user = await prisma.user({ where: { id: req.userId } });
//   req.user = user;
//   next();
// });

server.applyMiddleware({ app, path: '/', cors: corsOptions });

app.listen({ port: process.env.PORT || 4000 }, err => {
  if (err) throw err;
  console.log(
    `Apollo Server ready at http://localhost:${process.env.PORT}${
      server.graphqlPath
    }`
  );
});