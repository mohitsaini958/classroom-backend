import express, { Request, Response } from "express";

const app = express();
const PORT = 8000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Server is running successfully",
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});