const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { connect } = require('http2');
const { type } = require('os');
const bodyParser = require('body-parser');

app.use(express.json());
app.use(cors());


// build command "npm start"

// Database Connection With MongoDB
// mongoose.connect("mongodb+srv://isharajayarathna:20010708@cluster0.nuvnu.mongodb.net/e-commerce")
const atlas="mongodb+srv://isharajayarathna:20010708@cluster0.nuvnu.mongodb.net/e-commerce";

// connect to database

const connectDB=async()=>{

    // creating a method to make connection is importend while testing or error handling
    try {
        await mongoose.connect(atlas,{

        })
        console.log("Connected to MongoDB")
    } catch (error) {
        console.log("Failed to connect MongoDB : "+error)
        process.exit(1)
    }
}

// calling the function to make the connection between mongodb and backend
connectDB();

//API Ceration

app.get("/",(req,res)=>{
    res.send("Express App is Running")
})

// Image storage engine

const storage = multer.diskStorage({
    destination: (req,res,cb)=>{
        cb(null,'./upload/images')
    },
    filename:(req,file,cb)=>{
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
        // cb(null,`${file.filename}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({
    dest: "/app/upload/images/",
    storage:storage
})

//creating upload endpoint for images



//give access to upload/images folder for every one
app.use('/upload/images', express.static('upload/images/'));

// app.post("/upload", upload.single('product'), (req, res) => {
//     res.json({
//         success: 1,
//         Image_url: `http://localhost:${port}/images/${req.file.filename}`
//     });
// });


// Define the Product model
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
});

// Define the POST endpoint for adding a product
app.post('/addproduct',
    bodyParser.json(),
    upload.single('image'),
    async (req, res) => {
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    } 
    else{
        id=1;
    }

    if(req.file){
        const newProduct = new Product({
            id:id,
            name: req.body.name,
            // image: req.body.image,
            image: `http://localhost:${port}/`+req.file.path,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });
    
    
        // Save the new product to the database
        await newProduct.save();
    
        console.log("Saved");
    
        // Respond with success and the product name
        res.json({
            success: true,
            name: req.body.name,
        });
    }
    
});


//Creating API for deleting products

app.post('/removeproduct',async(req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

//Creating API for getting all products

app.get('/allproducts',async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})


app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on Port " + port)
    }
    else
    {
        console.log("Error : "+error)
    }
})


//mongodb+srv://isharajayarathna:20010708@cluster0.nuvnu.mongodb.net/?
