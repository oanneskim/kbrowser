var d3 = require('d3');
var lineChart = require( './line_chart');
var getLineChart = function (params){
	return lineChart(params);
}
module.exports = {
	getLineChart:getLineChart
};
