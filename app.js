const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path= require("path");
const methodOverride = require("method-override");//PUT requst sati method-override downlode kel ahe
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError= require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");


// const ejsMate = require("ejs-mate");//ejs-mate downlode kela he

const MONGO_URL= "mongodb://127.0.0.1:27017/wanderland";

main()
.then(()=>{
    console.log("connected to DB");
})
.catch(err=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded ({extended:true}));//data requst cha under ahe to data pass zala pahije mnun
app.use(methodOverride("_method"));//PUT requst sati
app.engine("ejs" , ejsMate);
app.use(express.static(path.join(__dirname, "/public")));//static file la use kra sati /public directry bnvle

app.get("/",(req, res) => {
    res.send("This project will start");
});
const validateListing = require
//Index rount
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//New route
app.get("/listings/new",(req, res) => {
    res.render("listings/new.ejs");//form la aapn render krun 
});

//show route
app.get("/listings/:id",wrapAsync(async (req, res) => {
    let {id} =req.params;
    const listing =await Listing.findById(id);//fist id la find kel mg id cha base vr data stor krushkto ani "show.ejs mdi" to data aapn pass krushkto
    res.render("listings/show.ejs",{listing});//listing cha data pass krt aho 
}));

//Creat route
app.post("/listings",wrapAsync(async (req, res, next) =>{
   let result= listingSchema.validate(req.body);
   console.log(result);
    const newListing= new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    //let {title, description, price, country, location}=req.body; ya fourmulya ni sgde variable la extract krushkto
    //nahi tr aapn ek key valu pair bnu shkto small formula use kru shkto
    // const newListing = new Listing(req.body.listing);//direct modul cha document cha under data la convert kru shkto data means title,price,description,location like this are the data 
    // await newListing.save();
    // res.redirect("/listings");
})
);

//edit route
app.get("/listings/:id/edit",wrapAsync(async (req, res) => {
    let { id } = req.params; //parameter vrun id extract krun
    const listing = await Listing.findById(id);//mg listing la find out krun
    res.render("listings/edit.ejs" , { listing });
}));

//update route
app.put("/listings/:id" ,wrapAsync (async (req, res) => {
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect("/listings");
}));

//Delete route
app.delete("/listings/:id",wrapAsync(async(req, res)=>{
    let {id}=req.params;
    let deletedListing= await Listing.findByIdAndDelete(id);
    console.log(deletedListing);//print hote 
    res.redirect("/listings");
}));

//Reviews
//Post Routs
app.post("/listings/:id/reviews", async(req,res) => {
    let listing = await Listing.findById(req.params.id)
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();
    
    res.redirect(`/Listings/${listing._id}`);
});

// app.get("/testListing", async (req, res) => {//new raout
//     let sampleListing = new Listing({
//         title:"my new villa",
//         descriptin:"By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country:"India",
//     });

// await sampleListing.save();
//  console.log("sample was saved");
//     res.send("successful testing");
// });//ha ek sample url ahe ja mdi appn document la add krun test krun pahat ahe

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page not found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error.ejs", { err });
});

app.listen(2003, () =>{
    console.log("server is listings to port 2003");
});