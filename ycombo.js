var apiKey = 'XXX'
var request = require('request');
var fs = require('fs');
var lo = require('lodash').flattenDeep;

function getIntegrations(file) { 
  var data = fs.readFileSync(file);
  var yCombo = []
  var companies = data.toString().split('\n');
  companies.forEach( function (companyWeb){
    var array = companyWeb.split(',');
    if (array[1].indexOf('.com') > -1) {
     yCombo.push(newCompany(array[0], array[1]));
   }
  });

  var iter = 0;
  var i = 0;
  yCombo.forEach(function(yCompany) {
    var companyWebsite = yCompany.website;
    var endpoint = 'http://api.builtwith.com/v7/api.json?KEY=' + apiKey + '&LOOKUP=' + companyWebsite;
      request(endpoint, function (error, response, body) {
        var tools = [];
        if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);
            if (res.Results[0] != null) {
              var paths = res.Results[0].Result.Paths;
              
              paths.forEach(function(path){
                path.Technologies.forEach(function(tech){
                  if (tech.Tag === 'analytics' || tech.Tag === 'advertising') {
                    tools.push(newTech(tech.Name, tech.Categories, tech.Description));
                  }
              });
            });
          yCombo[iter]['tech'] = tools;
          iter++; 
          }
        };
      });
  });
  setTimeout(function(){ toCSV(yCombo); }, 10000);

};

function toCSV(yCombo){
  var strArr = [];
  yCombo.forEach(function (yCompanyStack){
    console.log(yCompanyStack);
    if(yCompanyStack.tech) {
    yCompanyStack.tech.forEach(function (tech) {
     var str = yCompanyStack.companyName + ',' + yCompanyStack.website + ',' + tech.tech + ',' + tech.categories + ',' + tech.description + '\n';
     console.log(str);
     strArr.push(str);
    });
   }
  });
  fs.writeFile('stacks.csv', strArr);
}

function newCompany(companyName, companyWebsite){
  var yComboEntry = {'companyName': companyName, 'website': companyWebsite}
  return yComboEntry;
}

function newTech(name, categories, description){
  if (categories != null){
    categories = '[' + categories.toString() + ']';
  } else categories = 'null';
  var techEntry = {'tech': name, 'categories': categories.replace(/,/g, ''), 'description': description.replace(/,/g, '')};
  return techEntry;
}

getIntegrations('ycombinator2.txt');



