var express=require("express");
var app=express();
var mongoose = require("mongoose");
var bodyParser=require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

var dbstr = "mongodb+srv://babanbiswas:" + encodeURIComponent("Sept2019#") + "@cluster0-wegsi.mongodb.net/test?retryWrites=true&w=majority";
//mongoose.connect("mongodb://localhost/rest",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.connect(dbstr,{useNewUrlParser:true,
useUnifiedTopology:true,
useCreateIndex:true																												   }).then(() => {
	console.log("Connected to Database");
}).catch(err => {
	console.log("Error :",err.message);
});

//mongodb+srv://babanbiswas:Sept2019#@cluster0-wegsi.mongodb.net/test?retryWrites=true&w=majority
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	body : String,
	created : {type: Date,  default : Date.now}
});

var blog = mongoose.model("blog",blogSchema);
app.get("/",function(req,res){
	
		res.redirect("/blogs");
	
});
//INDEX route
app.get("/blogs", function(req,res){
	blog.find({}, function(err,blogs){
		if(err){
			console.log(err);
		}
		else{
			res.render("index",{blogs:blogs});
		}
	});
	
});
//NEW route
app.get("/blogs/new", function(req,res){
	res.render("new");
});
//CREATE route
app.post("/blogs", function(req,res){
	
	req.body.blog.body = req.sanitize(req.body.blog.body);
	
	//create blog
	blog.create(req.body.blog, function(err, newBlogs){
		if(err){
			res.render("new");
		}
		else{
				res.redirect("/blogs")	   
			}			   
	});
});

// Show route
app.get("/blogs/:id", function(req,res){
	//console.log(req.params.id);
	blog.findById(req.params.id, function(err,foundBlog){
		
		if(err){
			res.redirect("/blogs");
		}
		else{
			console.log(foundBlog);
			res.render("show",{blog:foundBlog});
		}
	});
});

//Edit route
app.get("/blogs/:id/edit", function(req,res){
	blog.findById(req.params.id, function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit",{blog:foundBlog});
		}
	});
});

//Update route
app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

//Delete route



app.delete("/blogs/:id", function(req,res){
	blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});
app.listen(process.env.PORT||3000, process.env.IP, function(){
	console.log("Server is running");
})
