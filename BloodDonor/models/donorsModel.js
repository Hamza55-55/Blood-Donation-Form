const mongoose=require('mongoose');
const donationSchema=new mongoose.Schema({
    radiobtn:String,
    donorName:String,
    donorDOB:Date,
    donorEmail:String,
    donorPhone:Number,
    donorWeight:String,
    donorPulse:String,
    donorHb:String,
    donorBp:String,
    lastdonationdate:Date,
    gnradio:String,
    disease:[String],
  });
  module.exports=mongoose.model("donor_list",donationSchema);