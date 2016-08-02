var watson = require('watson-developer-cloud');
var cheerio = require('cheerio');
var fs = require('fs');

var OUTPUT_DIR = '../data/converted';
var SECTION_EXCLUDE = [
  'Views',
  'Tools',
  'Print/export',
  'Personal tools',
  'Navigation',
  'Namespaces',
  'Languages',
  'Interaction',
  'In other projects',
  'Contents'
];

var SOURCE_DOCS = [];

var document_conversion = watson.document_conversion({
  username:     'e0ed6d48-8261-4066-b28a-f75ca62f23fc',
  password:     'PwYq7OLmOmk6',
  version:      'v1',
  version_date: '2015-12-01'
});


buildDocumentList();
convertNextDocument();


function buildDocumentList(){
  var filenames = fs.readdirSync('../data/wikipedia-test-grounds');
  if(filenames){
    for(var i=0; i < filenames.length; i++){
        SOURCE_DOCS.push('../data/wikipedia-test-grounds/'+filenames[i]);
    }
  }
}


function convertNextDocument(){
  if(SOURCE_DOCS && SOURCE_DOCS.length > 0){
    convertDocument(SOURCE_DOCS.pop());
  }
  else{
    console.log("Finsihed");
  }
}


function convertDocument(fileName){
  // convert a single document

  fs.readFile(fileName, 'utf8', function(err, contents) {
    if(!err){
      var $ = cheerio.load(contents);
      var title = $('h1').text();
      var random = Math.round(Math.random()*1000000);

      var paragraphs = $('p').each(function(i, elem) {
        if(title && title.length > 0 && $(this).text() && $(this).text().length > 0){
        var outputFileName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_' + random + '_' + i +'.json';
          outputDocument(outputFileName, title, $(this).text());
        }
      });
    }
    else{
      console.log(err);
    }
    convertNextDocument();
  });


  /*
  document_conversion.convert({
    // (JSON) ANSWER_UNITS, NORMALIZED_HTML, or NORMALIZED_TEXT
    file: fs.createReadStream(fileName),
    conversion_target: document_conversion.conversion_target.ANSWER_UNITS,
    // Add custom configuration properties or omit for defaults
    word: {
      heading: {
        fonts: [
          { level: 1, min_size: 24 },
          { level: 2, min_size: 16, max_size: 24 }
        ]
      }
    }
  }, handleConversionResults);
  */
}

/*
function handleConversionResults(err, response){
  if (err) {
    console.error(err);
  } else {

    if(response && response.answer_units){
        var documentTitle = false;
        for(var i=0; i < response.answer_units.length; i++){
          var answerUnit = response.answer_units[i];
          if(answerUnit && answerUnit.type && answerUnit.type == 'h1'){
            documentTitle = answerUnit.title;
          }
        }

        for(var i=0; i < response.answer_units.length; i++){
          var answerUnit = response.answer_units[i];
          if(answerUnit && answerUnit.type && (answerUnit.type == 'h2' || answerUnit.type == 'h3')){
            var sectionTitle = answerUnit.title;
            var sectionContent = '';
            if(answerUnit.content){
              for(var j=0; j < answerUnit.content.length; j++){
                var content = answerUnit.content[j];
                if(content && content.media_type && content.media_type == 'text/plain' && content.text && content.text.length > 0){
                  sectionContent = sectionContent + content.text + ' ';
                }
              }
            }
          }

          if(documentTitle && sectionTitle && sectionContent){
            if(sectionTitle.indexOf('edit') &&  sectionTitle.indexOf('edit')>0){
              sectionTitle = sectionTitle.substr(0,sectionTitle.indexOf('edit')-1);
              sectionTitle = sectionTitle.trim();
            }
            if(!exclude(sectionTitle)){
              outputDocument(documentTitle + ' - ' + sectionTitle, sectionContent);
            }
          }

        }
    }

  }
  convertNextDocument();
}
*/


function exclude(section){
  for(var i=0; i < SECTION_EXCLUDE.length; i++){
    var excludeSection = SECTION_EXCLUDE[i];
    if(section == excludeSection){
      return true;
    }
  }
  return false;
}


function outputDocument(filename, title, content){
  var outputFile = OUTPUT_DIR + '/' + filename
  //  content = content.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  var outputObject = {};
  outputObject.title = title;
  outputObject.body = content;

  var outputContent = JSON.stringify(outputObject);

  fs.writeFile(outputFile, outputContent, function(err) {
      if(err) {
        console.log('Error with file: ' + outputFile + ' ' + err);
      }
      else{
        console.log("The file was saved: " + outputFile);
      }
  });

}
