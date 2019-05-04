# next-graphql-starter

> A boilerplate/example app that includes functionality to sign up/in/out, and reset password

> View the app at https://next-graphql-starter.hmmchase.now.sh/
>
> - Don't use a real email address to sign up

## Built with

- Next.js
- Apollo Client
- Apollo Server
- Prisma
- Styled Components

### Notes

- User authentication implemented with a JWT and cookie
- I'm always looking for better ways to do things, so please give suggestions/pull requests

## Getting Started

### Clone project

`git clone https://github.com/hmmChase/next-graphql-starter.git`

### Install dependencies

1. Navigate to root `/`
2. Run `npm install`
3. Run `npm frontend:install`
4. Run `npm backend:install`

### Setup Prisma server

For simplicity's sake, we are using a demo server

- First time
  - Visit [Prisma](https://www.prisma.io/) and sign up
  - Install [CLI](https://www.prisma.io/docs/prisma-cli-and-configuration/using-the-prisma-cli-alx4/) and login

1. Navigate to `/backend`
2. run `npm run deploy -- -n`
3. Select `Demo server + MySQL database`
4. Complete the prompts
5. Copy `HTTP` endpoint
6. Paste endpoint in `.env` as `PRISMA_ENDPOINT`

### Setup Mailtrap

- First time
  - Visit [Mailtrap](https://mailtrap.io) and sign up
  - Create demo inbox

1. Copy `Host`, `Port`, `Username`, and `Password` values
2. Paste in `/backend/.env`

### Set environment variables

1. Locate `.env.example` in both `/frontend` and `/backend`
2. Make a copy of both
3. Delete the extension `.example`
4. Update the values

- If deploying to [Now](https://zeit.co/now), follow `now-secrets.md`

### Start the app

1. Navigate to root `/`
2. Run `npm run app`
3. Visit `http://localhost:8008/`

### Deploy to Now

-
