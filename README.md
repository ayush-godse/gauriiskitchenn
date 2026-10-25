# new-diwali_faral

Homemade Diwali faral storefront built with a React frontend, Express API, and MongoDB.

## Deploy on Render

This repository includes a Render Blueprint at [`render.yaml`](./render.yaml). It deploys
the frontend and API together as one Node web service: the frontend is built during
deployment, and the Express server serves it alongside the `/api` routes.

1. Push this repository to GitHub and create a new Blueprint Instance in Render using
   the repository.
2. Add the environment variables below when prompted, then deploy. Render provides
   `PORT` automatically; the app listens on it.
3. After deployment, open the service URL. The `/health` endpoint should return
   `{"status":"ok"}`.

### Required environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string. Configure Atlas network access to allow connections from Render. |
| `JWT_SECRET` | Long, random secret used to sign authentication tokens. |

### Optional feature configuration

Set these in the Render service's environment settings when enabling the related features:

| Variables | Purpose |
| --- | --- |
| `EMAIL_USER`, `EMAIL_PASS` | SMTP username and password for login OTPs and order emails. |
| `SMTP_HOST`, `SMTP_PORT` | Optional SMTP server settings. Set the host and use port `2525` for an SMTP provider that supports it. When `SMTP_HOST` is unset, the app keeps using Gmail SMTP. |
| `EMAIL_FROM` | Optional verified sender address; defaults to `EMAIL_USER`. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Product image uploads. |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay payments. |
| `FRONTEND_URL` | Additional allowed browser origin if the frontend is hosted separately. Leave unset when using the single-service deployment. |

Do not commit credentials or put backend secrets in frontend `REACT_APP_*` variables.

## Local development

Create `backend/.env` using [`backend/.env.example`](./backend/.env.example), then install
the frontend and backend dependencies with `npm run install-all`. Start both apps using
`npm run dev`.