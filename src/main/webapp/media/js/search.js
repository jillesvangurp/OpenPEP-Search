/**
Open PEP Search
Copyright (C) 2013, 2013, TESOBE / Music Pictures Ltd

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

Email: contact@tesobe.com
TESOBE / Music Pictures Ltd
Osloerstrasse 16/17
Berlin 13359, Germany

  This product includes software developed at
  TESOBE (http://www.tesobe.com/)
  by
  Simon Redfern : simon AT tesobe DOT com
  Nina Gänsdorfer: nina AT tesobe DOT com
  Ayoub Benali: ayoub AT tesobe DOT com

 */

$(document).ready(function(){
  enableButtons()
  if($(location).attr('search') && $(location).attr('search') != ""){
    if($(location).attr('pathname').indexOf("/details")!= -1){
      getIdDetailsFor(GetURLParameter("id"))
    }
    else{
      // if there are search parameters, then start search
      if($(location).attr('search') && $(location).attr('search') != ""){
        initializeSearch()
      }
    }
  }
})


function enableButtons(){
  $("#searchBtn").click(function() {
    attachParamsToURL()
   })

  $("#advancedBtn").click(function() {
    $('#advancedSearchBox').show('slow')

    $("#birthday").datepicker();

    $("#closeBox").click(function() {
      $('#advancedSearchBox').hide('fast')
     })
   })
}

// search can also be started by pressing enter
$(document).keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
    attachParamsToURL();
  }
})

// prepare search: load index with search params in url
function attachParamsToURL(){
  var search = $('#search_word').val()
  var fields = getNameArray()
  var res = $('#residence').val()
  var cit = $('#citizenship').val()
  window.location.href = '/index.html?search='+search+'&fields='+fields+'&res='+res+'&cit='+cit;
}



// starting the search:
function initializeSearch(){
  search = GetURLParameter('search')
  limit = 5,
  fields = GetURLParameter('fields')
  res = GetURLParameter('res')
  cit = GetURLParameter('cit')
  $('#search_word').val(search)
  sendSearchRequest()
}

function GetURLParameter(sParam){
  var sPageURL = window.location.search.substring(1)
  var sURLVariables = sPageURL.split('&')
  for (var i = 0; i < sURLVariables.length; i++){
    var sParameterName = sURLVariables[i].split('=')
    if (sParameterName[0] == sParam){
      return sParameterName[1]
    }
  }
}

function sendSearchRequest(){
  $.ajax({
    type: "GET",
    url: "/search?source="+createSearchJson(),
    success: function(data){
      displayData(data.hits)
    },
    dataType: "json"
  });
}

function createSearchJson(){
  var search_json ='{'
  search_json += '"from":0,"size":'+limit+','
  search_json += '"query":{'
  search_json += '"bool":{'
  search_json += '"must":['
  search_json += '{'
  search_json += '"multi_match":{'
  search_json += '"query":"'+search+'",'
  search_json += '"fields":'+fields+','
  search_json += '"fuzziness":0.8'
  search_json += '}'
  search_json += '}'
  // Birthday parameter is currently ignored, because
  // there is no birthday available on Elastic Search
  // if ($('#birthday').val() != ""){
  //   search_json += ',{'
  //   val birthday = "" /need to transform in the right format
  //   search_json += '"match":{"Birthday":"'+$('#birthday').val()+'"}'
  //   search_json += '}'
  // }
  if (res && res != ""){
    search_json += ',{'
    search_json += '"match":{"Country of residence":"'+res+'"}'
    search_json += '}'
  }
  if (cit && cit != ""){
    search_json += ',{'
    search_json += '"match":{"Country of Citizenship":"'+cit+'"}'
    search_json += '}'
  }
  search_json += ']'
  search_json += '}'
  search_json += '}'
  search_json += '}'
  return search_json
}


// search in First name  / Last name / All names (default), depending on selected radio button in advanced search
function getNameArray(){
  var name_array = []
  var name_field = $('input[name=field]:checked').val()
  if(name_field == "first")
    name_array = ["First Name"]
  else if (name_field == "last")
    name_array = ["Last Name"]
  else
    name_array = ["First Name", "Middle Name", "Last Name"]
  return JSON.stringify(name_array)
}


// if the search was successful, display data in #display
function displayData(data) {
  $('#display').addClass('displayResults')
  $('#display').html("")
  if (data.total > 0){
    $('#display').append("<table id='resultTable'><tr><th>First</th><th>Middle</th><th>Surname</th><th>Position</th><th>Nationality</th><th>Residence</th></tr></table>")
    $.each(data.hits, function(i, person) {
      $('#resultTable').append("<tr class='personRow' name="+i+" id='personRow"+i+"'></tr>")
      $('#personRow'+i).append("<td>"+person._source["First Name"]+"</td>")
      $('#personRow'+i).append("<td>"+person._source["Middle Name"]+"</td>")
      $('#personRow'+i).append("<td>"+person._source["Last Name"]+"</td>")
      $('#personRow'+i).append("<td>"+person._source["Position"]+"</td>")
      $('#personRow'+i).append("<td>"+person._source["Country of Citizenship"]+"</td>")
      $('#personRow'+i).append("<td>"+person._source["Country of residence"]+"</td>")
    })
    if(data.total > limit){
      $('#display').append('<div id="moreResults"><img src="/media/images/arrow.png">More Results</div>')
    }
    enableClick(data.hits)
  }
  else{
    $('#display').append('<div id="noResult" class="not-found"></div>')
    $('#noResult').append( '<p>It looks like we haven’t found the name you gave us in our database. This does not necessarily mean that the individual you are looking for is not a PEP.</p>')
    $('#noResult').append( '<p>We encourage financial institutions to take a comprehensive risk based approach to due diligence. Registered users are invited to search other sources and add information to the database.</p>')
    $('#noResult').append( '<p><a href="#">Upload</a></p>')
  }

  if(data.total > limit){
    $("#moreResults").click(function() {
      limit = limit+5
      sendSearchRequest()
    })
  }
}

// enable click on row for getting details of that person
function enableClick(hits) {
  $(".personRow" ).click(function() {
    var id= hits[$(this).attr("name")]._source["Register"]
    window.location.href = '/details?id='+id;
  })
}


// search for a specific person/id
// TODO: right now we use the source field 'Register' to get the person, should be replaced by a unique id
function getIdDetailsFor(id){
  $.ajax({
    type: "GET",
    url: '/search?source={"query":{"bool":{"must":{"match":{"Register":"'+id+'"}}}}}',
    success: function(data){
      if(data.hits.total > 0){
        fillDetailPage(data.hits.hits[0])
      }
      else{
        noDetailsFor(id)
      }
    },
    dataType: "json"
    });
}


function fillDetailPage(person){
  $("#title_field").append(person._source['Title'])
  $("#first_name_field").append(person._source['First Name'])
  $("#last_name_field").append(person._source['Last Name'])
  $("#other_names_field").append(person._source['Middle Name'])
  // $("#original_spelling_field").append(person._source[''])
  $("#position_field").append(person._source['Position'])
  // $("#birthday_field").append(person._source[''])
  $("#citizenship_field").append(person._source['Country of Citizenship'])
  $("#residence_field").append(person._source['Country of residence'])
  // $("#in_office_since_field").append(person._source[''])
  // $("#out_office_since_field").append(person._source[''])
  // $("#expected_until_field").append(person._source[''])
  $('#source_field').append('<a href="'+person._source['Website']+'">'+person._source['Website']+'</a>')
}

function noDetailsFor(id){
  $('.displayDetails').html("")
  $('.displayDetails').append('<p class="not-found">No details for id <b>'+id+'</b> found.</p>')
}






