function convertUnixTime(input){
  let date = new Date(input * 1); // No idea why that * 1 is necessary. It doesn't work without it tho
  let hours = String(date.getHours());
  let minutes = date.getMinutes();
  date = date.toLocaleDateString('en-US'); // To format MM/DD/YYYY
  if(minutes < 10){
    minutes = "0" + String(minutes);
  }else{
    minutes = String(minutes);
  }
  return date + " " + hours + ":" + minutes; // Time is in format HH:MM
}
