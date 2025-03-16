import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = 8000;

app.use(cors());

// Calculate expiration time 
//mins*seconds*milliseconds
const expirationTime = new Date(Date.now() + 10* 60 * 1000); 

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