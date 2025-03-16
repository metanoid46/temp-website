import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Use the port from the environment variable or default to 8000
const port = process.env.PORT || 8000;

// Enable CORS
app.use(cors());

// Calculate expiration time (10 minutes from now)
const expirationTime = new Date(Date.now() + 10 * 60 * 1000);

app.get('/api/check-expiration', (req: Request, res: Response) => {
    const now = new Date();
    if (now > expirationTime) {
        res.json({ expired: true });
    } else {
        res.json({ expired: false, expirationTime: expirationTime.toISOString() });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
