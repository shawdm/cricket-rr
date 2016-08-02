var watson = require('watson-developer-cloud');
var fs = require('fs');

var SOURCE_DOCS = [];

var retrieve_and_rank = watson.retrieve_and_rank({
  username: '0e898e0d-09cb-4ee1-a3e4-e51e7a6a4694',
  password: 'UMcTRjwJqUQA',
  version: 'v1'
});

var params = {
  cluster_id: 'sc199ec5f2_70e2_4149_9413_4e3bbd2b4b85',
  collection_name: 'cricket-grounds',
};

var solrClient = retrieve_and_rank.createSolrClient(params);


buildDocumentList();
uploadNextDocument();


function buildDocumentList(){
  var baseDir = '../data/converted';
  var filenames = fs.readdirSync(baseDir);
  if(filenames){
    for(var i=0; i < filenames.length; i++){
        SOURCE_DOCS.push(baseDir+'/'+filenames[i]);
    }
  }
}

function uploadNextDocument(){
  var doc = SOURCE_DOCS.pop();

  if(doc){
    fs.readFile(doc, 'utf8', function (err, data) {
      if (err){
        console.log(err);
      }
      else{
          var parsedData = JSON.parse(data);
          solrClient.add(parsedData, function (err, response) {
            if (err) {
              console.log('Error indexing document: ' + doc, err);
            }
            else {
              console.log('Indexed a document: ' + doc);
              solrClient.commit(function(err) {
                if(err) {
                  console.log('Error committing change: ' + err);
                }
                else {
                  console.log('Successfully committed changes.');
                }
                uploadNextDocument();
              });
            }
          });
      }

    });
  }
}
