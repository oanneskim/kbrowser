
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'BAM URL', bed: 'BED12 results will be shown here' });
};
