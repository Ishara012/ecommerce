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


//Schema creating for user model

const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//Creating endpoint for registring the user

app.post('/signup',async (req,res)=>{

    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found with same email adress "})
    }
    let cart = {};
    for (let i = 0; i < 300; i++) {
         cart[i]=0;   
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })

    await user.save();

    const data = {
        user:{
            id:user.id
        }
    }

    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

//creating endpoing for user login

app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong email Id"})
    }
})

//creating endpoint for new collection data

app.get('/newcollection',async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})

//creating endpoint for popular in women section

app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popular_in_women);
})

//creating endpoint for adding products in cartdate

app.post('/addcart',async (req,res)=>{
    console.log(req.body);
    
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
