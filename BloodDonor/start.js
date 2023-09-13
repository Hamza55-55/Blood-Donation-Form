
const app = require('express')();
const bparser = require('body-parser');
const mongoose = require('mongoose');
const { Session } = require('inspector');
const date = require('date-and-time');
const donors_list = require("./models/donorsModel.js");
const path = require('path');
const http=require('http');

const apiKey='mongodb://0.0.0.0:27017/hello_web';
mongoose.connect(apiKey, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => {
    console.log("Successfully Connected to mongodb");
  })
  .catch((error) => {
    console.log("Error:", error);
  });
var urlencodedParser = bparser.urlencoded({ extended: true });
// ________________PORT_______________
const PORT= 8000;
  app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`)
  });
  // _______________ejs connection_____________

  app.set('view engine', 'ejs');

  // ____________________GET Req_____________________
  const emptyFilters={};

  app.get('/bloodDonationForm.htm',async(req,res)=>{
    res.sendFile(path.join(__dirname, './blooddonationform.html'));
  }); 
  app.get('/donorsList.css',async(req,res)=>{
    res.sendFile(path.join(__dirname, './donorsList.css'));
  }); 

  app.get('/editDonor.htm',async(req,res)=>{
    let donorId = req.query.donorId;
    console.info("/editDonor.htm donorId = "+donorId);
    try {
      let result=await donors_list.findById(donorId).exec();
      console.log("Results found = "+result);
      let donor = result;
      donor.dob = date.format(donor.donorDOB,'YYYY-MM-DD');
      donor.lastdonation = date.format(donor.lastdonationdate,'YYYY-MM-DD');
      res.render('editDonor', {
        donor : donor,
      });
      
    } catch (error) {
      console.log("Errorr retreving donor from DB:",error);
    }
  });

  app.get('/deleteDonor.htm', async (req, res) => {
    try {
      let donorId = req.query.donorId;
      let result = await donors_list.findById(donorId).exec();
      let donor = result;
      res.render('deleteDonor', {
        donor: donor,
      });
    } catch (error) {
      console.log("Error retrieving donor from DB:", error);
    }
  });

  app.get('/donorsInfo.htm',async(req,res)=>{
    getDonoroList(req, res);
  });

  

// _________________________POST Req____________________________________


  app.post('/donateblood',urlencodedParser,async(req,res)=>{
    let{ radiobtn,donorName,donorDOB,donorEmail,donorPhone,donorWeight,donorPulse,donorHb,donorBp,lastdonationdate,gnradio}=req.body;
    let disease = req.body.disease; 

    try{
      const donors=new donors_list({
        radiobtn,
        donorName,
        donorDOB,
        donorEmail,
        donorPhone,
        donorWeight,
        donorPulse,
        donorHb,
        donorBp,
        lastdonationdate,
        gnradio,
        disease:disease,
      });
        await donors.save();
        console.log("Donor saved to db.");
        res.send("Donor Saved :)");
    } catch(error){
        console.log("Donor not saved",error);
    }
    
  });

  app.post('/editDonateBlood.htm',urlencodedParser,async(req,res)=>{
    let{donorId, donorName,donorDOB,donorEmail,donorPhone,donorWeight,donorPulse,donorHb,donorBp,lastdonationdate}=req.body;
    let diseases=req.body.disease;
    console.info("/editDonateBlood.htm ....donorId="+donorId);
    
    try{
      let result=await donors_list.findById(donorId).exec();
      result.donorName = donorName;
      result.donorDOB = donorDOB; 
      result.donorEmail = donorEmail;
      result.donorPhone = donorPhone;
      result.donorWeight = donorWeight;
      result.donorPulse = donorPulse;
      result.donorHb = donorHb;
      result.donorBp = donorBp;
      result.lastdonationdate = lastdonationdate;
      result.disease = diseases; 
      result.donorName = donorName;
      await result.save();
      message = "Donor updated successfully";
        console.log("Donor saved to db.");
    } catch(error){
        console.log("Donor not saved",error);
    }
    
    getDonoroList(req, res, "Donor updated successfully.");
  });

  app.post('/deleteDonateBlood.htm', urlencodedParser, async (req, res) => {
    try {
      const deletedDonor = await donors_list.deleteOne({ _id: req.body.donorId });
      if (deletedDonor.deletedCount === 1) {
        console.log("Deleted successful donor", deletedDonor);
      } else {
        console.log("Can't delete donor, donor not found.");
      }
    } catch (error) {
      console.log("Error deleting donor.", error);
    }
    
    getDonoroList(req, res, "Donor deleted successfully.");
  });
  



  async function getDonoroList(req,res, message){
    try {
      
      let result=await donors_list.find(emptyFilters).exec();
      console.log("Results found = "+result.length);
      let donorList=new Array(result.length);
      for(let i=0; i<result.length;i++){
        donor=result[i];
        donorList.push(donor);
      }
      res.render('donorsList', {
        listdonators: donorList,
        message:message
      });
    } catch (error) {
      console.log("Errorr on retreving donors!",error);
    }
  }

