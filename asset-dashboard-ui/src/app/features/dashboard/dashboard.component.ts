import { Component, OnInit,Input } from '@angular/core';
//Import Data points
import { AssetsService } from '../assets.service';
import { Asset } from '../assets/asset'

/* 
This declare fixes the Chart error below. Since we are using the CDN,
You cannot import the Chart asset directly. So declare an anytype var
Which will allow us to skip the error. 
*/
declare var Chart: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})




export class DashboardComponent implements OnInit {

    assets : Asset[];
    uniqueAssets : Asset[];
    historyMap : Map<any, any>;

    riskAnalysis : any = {
        highRiskCount : 0,
        mediumRiskCount : 0,
        lowRiskCount : 0
    }

  selectedAssetAnalysis : any;

  constructor(private service: AssetsService) {

    //Init
    this.assets = service.getAssets();
    var assets = this.assets;

    // create unique assets
    this.uniqueAssets = this.initWithUnique(assets);

    // create map with pump history
    this.historyMap = this.initHistoryMap(assets);

    this.riskAnalysis = {};
    this.riskAnalysis.lowRiskCount = 0;
    this.riskAnalysis.mediumRiskCount = 0;
    this.riskAnalysis.highRiskCount = 0;
    this.selectedAssetAnalysis = {};
 }

 //Table Click
 tableClick(index){
  this.selectedAssetAnalysis = this.uniqueAssets[index];
}

// chart summary will be triggered here 
filterData(selectedAssetAnalysis) {
    console.log("selected id: "+selectedAssetAnalysis.id);
    var minDate = new Date((<HTMLInputElement>document.getElementById('min')).value).getTime();
    var maxDate = new Date((<HTMLInputElement>document.getElementById('max')).value).getTime();
    // NaN check
    if (isNaN(minDate)) {minDate = 0;}
    if (isNaN(maxDate)) {maxDate = 9999999999999}
    //console.log("date format: "+document.getElementById('min').value)
    console.log("min date: "+minDate);
    console.log("max date: "+maxDate);
    var pumpHistory = this.historyMap.get(selectedAssetAnalysis.id); 

    // init data
    var dataset = [];
    var label = [];

    var selector = <HTMLInputElement>document.getElementById('attrSelector'));
    var attributeSelect = selector.options[selector.selectedIndex].value;
    console.log(attributeSelect);

    for (var i = 0; i < pumpHistory.length; i++) {
      var pumpTimeStamp = new Date(pumpHistory[i].timestamp).getTime();
      // filter values
      if (pumpTimeStamp >= minDate && pumpTimeStamp <= maxDate) {
        // plot here
        // add desired attribute
        if (attributeSelect === 'temperature') {dataset.push(pumpHistory[i].temperature);}
        else if (attributeSelect === 'pressure') {dataset.push(pumpHistory[i].pressure);}
        else if (attributeSelect === 'flow') {dataset.push(pumpHistory[i].flowRate);}
        else if (attributeSelect === 'current') {dataset.push(pumpHistory[i].current);}
        else if (attributeSelect === 'rotation') {dataset.push(pumpHistory[i].rotation);}
        label.push(pumpHistory[i].timestamp);

      }
    }
    if (label.length < 1) {
        //console.log("no data points");
        (<HTMLInputElement>document.getElementById('errorMessage')).value = "No data points in specified range!";
    }
    // add unit of measurement
    if (attributeSelect === 'temperature') {attributeSelect += ' (°F)';}
    else if (attributeSelect === 'pressure') {attributeSelect += ' (Pa)';;}
    else if (attributeSelect === 'flow') {attributeSelect += ' (m3/s)';}
    else if (attributeSelect === 'current') {attributeSelect += ' (A)';}
    else if (attributeSelect === 'rotation') {attributeSelect += ' (rad/s)';}
    var data: any = {};
    data.labels = label;
    data.datasets = [];
    data.datasets.push(
          { 
            data: dataset,
            label: attributeSelect,
            borderColor: "#c45850",
            fill: false
          });
    this.buildChart(data);
  }

  buildChart(data){
    console.log("build chart");
    new Chart(document.getElementById("line-chart"), {
      type: 'line',
      data: data,
      options: {
        title: {
          display: true,
          text: 'Pump attributes over specified date range'
        }
      }
    });
  }

  ngOnInit() {
    var data: any = {};
    data.labels = [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050];
    data.datasets = [];
    data.datasets.push( 
          {
            data: [6,3,2,2,7,26,82,172,312,433],
            label: "FillerData",
            borderColor: "#c45850",
            fill: false
          });
    this.buildChart(data);

    for(var i = 0; i<this.uniqueAssets.length;i++){
      if(this.uniqueAssets[i].pressure >= 100 || this.uniqueAssets[i].pressure <50){
          this.riskAnalysis.highRiskCount++;
         this.uniqueAssets[i].riskRating = 'High';
         this.uniqueAssets[i].riskColor = 'red'

       }
       else if((this.uniqueAssets[i].pressure >= 50 && this.uniqueAssets[i].pressure <60 )|| (this.uniqueAssets[i].pressure <100 && this.uniqueAssets[i].pressure >=90)){
         this.riskAnalysis.mediumRiskCount++;
         this.uniqueAssets[i].riskRating = 'Medium';
         this.uniqueAssets[i].riskColor = 'yellow';
       }
       else{
       this.riskAnalysis.lowRiskCount++;
       this.uniqueAssets[i].riskRating = 'Low';
       this.uniqueAssets[i].riskColor = 'green';
      }
   }

  // figure out this error! Temporary bracket:
  
  //
  }
  // display with latest timestamp
  initWithUnique(assets) {

    //Get Uniques
    var flags = [], output = [], l = assets.length, i, mostRecentValue;
    // set current timestamp to minimum
    mostRecentValue = 0; 
    // build map of pumps to timestamps
    var mostRecents = new Map();
    for (i = 0; i < l; i++ && assets[i]) {
      if (mostRecents.get(assets[i].id) == null) { // ID does not yet exist
        mostRecents.set(assets[i].id, i);
      }
      else { // ID exists, check timestamp against current
        if (assets[mostRecents.get(assets[i].id)].timestamp < assets[i].timestamp) {
          mostRecents.set(assets[i].id, i);
        }
      }
    }

    // output hashmap of pumps with most recent timestamps
    mostRecents.forEach(function(value, key) {
      //console.log(key + ' = ' + value);
      output.push(assets[value]);
    });

    return output;
  }

  // initialize map of form <pump id, list of different timestamp objects>
  initHistoryMap(assets) {

    var historyMap = new Map();

    for (var i = 0; i < assets.length && assets[i]; i++) {
        if (historyMap.get(assets[i].id) == null) { // ID does not yet exist, add first asset to list
          var startList = []
          startList.push(assets[i]);
          historyMap.set(assets[i].id, startList);
        }
        else { // ID exists, add asset to current list
          var currentList = historyMap.get(assets[i].id);
          currentList.push(assets[i]);
          historyMap.set(assets[i].id, currentList);
        }
    }

    historyMap.forEach(function(value, key) {
      //console.log(key + ' = ' + value);
      for (var i = 0; i < value.length; i++) {
        //console.log("temperature: " + value[i].temperature + "\n")
      }
    });
    return historyMap;
  }


}
