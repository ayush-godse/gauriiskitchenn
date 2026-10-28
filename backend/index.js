const express= require("express");
const app= express();
const cors= require("cors");
const dotenv= require("dotenv");
const path = require("path");
const userRoutes= require("./routes/authRoutes");
dotenv.config({ path: path.join(__dirname, ".env") });
const connectDB = require("./config/db");
app.use(cors(
    {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000", process.env.FRONTEND_URL].filter(Boolean),
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use('/api/auth', userRoutes);
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes.js'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
if(process.env.NODE_ENV ==='production'){
    app.use(express.static(path.join(__dirname,'../frontend/build')));
    app.get('/{*splat}',(req,res)=>{
        res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'))
    });

}else{
    app.get('/',(req,res)=>{
        res.send('diwali faral is running on development mode...')
    })
}
const port= process.env.PORT || 5000;
const startServer = async () => {
    await connectDB();
    app.listen(port,()=>{
        console.log(`Server is running on port ${port}`);
    });
};

startServer();
