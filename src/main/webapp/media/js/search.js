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
      enableClick(data.hits)
    }
    else{
      $('#display').append( '<p class="not-found">It looks like we haven’t found the name you gave us in our database. This does not necessarily mean that the individual you are looking for is not a PEP.</p>')
      $('#display').append( '<p class="not-found">We encourage financial institutions to take a comprehensive risk based approach to due diligence. Registered users are invited to search other sources and add information to the database.</p>')
      $('#display').append( '<p class="not-found"><a href="#">Upload</a></p>')
    }
  }

  function enableClick(hits) {
    $(".personRow" ).click(function() {
      var id= hits[$(this).attr("name")]._source["Register"]
      window.location.href = '/details?id='+id;
    })
  }

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

function createSearchJson(){
  var search_json = '{'
  search_json += '  "query" : {'
  search_json += '    "bool" : {'
  search_json += '      "must" : ['
  search_json += '        {'
  search_json += '          "multi_match" : {'
  search_json += '            "query" : "'+$('#search_word').val()+'",'
  search_json += '            "fields" : '+getNameArray()
  search_json += '          }'
  search_json += '        }'
  // Birthday parameter is currently ignored, because
  // there is no birthday available on Elastic Search
  // if ($('#birthday').val() != ""){
  //   search_json += '        ,{'
  //   val birthday = "" /need to transform in the right format
  //   search_json += '          "match" : {"Birthday" : "'+$('#birthday').val()+'"}'
  //   search_json += '        }'
  // }
  if ($('#residence').val() && $('#residence').val() != ""){
    search_json += '        ,{'
    search_json += '          "match" : {"Country of residence" : "'+$('#residence').val()+'"}'
    search_json += '        }'
  }
  if ($('#citizenship').val() && $('#citizenship').val() != ""){
    search_json += '        ,{'
    search_json += '          "match" : {"Country of Citizenship" : "'+$('#citizenship').val()+'"}'
    search_json += '        }'
  }
  search_json += '      ]'
  search_json += '    }'
  search_json += '  }'
  search_json += '}'
  return search_json
}

$(document).ready(function(){
  getSearchParam()

  $("#searchBtn").click(function() {
    doSearch()
   })

  $("#advancedBtn").click(function() {
    $('#advancedSearchBox').show('slow')

    $("#birthday").datepicker();

    $("#closeBox").click(function() {
      $('#advancedSearchBox').hide('fast')
     })
   })
})

function sendSearchRequest(){
  $.ajax({
    type: "GET",
    url: "http://localhost:8080/search?source="+createSearchJson(),
    success: function(data){
      displayData(data.hits)
    },
    dataType: "json"
  });
}

function getSearchParam(){
  if($(location).attr('search') && $(location).attr('search') != ""){
    var param = $(location).attr('search')
    var array = param.split("=");
    var search = array[1]
    if(array[0]=='?s'){
      var search = array[1]
      $('#search_word').val(search)
      sendSearchRequest()
    }
    else if(array[0]=='?id'){
      getIdDetailsFor(array[1])
    }
  }
  else if($(location).attr('pathname').indexOf("/details")!= -1){
    noDetailsFor("no id")
  }
}

function getIdDetailsFor(id){
  $.ajax({
    type: "GET",
    url: 'http://localhost:8080/search?source={"query":{"bool":{"must":{"match":{"Register":"'+id+'"}}}}}',
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



$(document).keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
    doSearch();
  }

});

function doSearch(){
  if($('#search_word').val() && $('#search_word').val() != "" ){
    $('#advancedSearchBox').css( "display", "none" )
      if(($(location).attr('pathname').indexOf("/about") != -1) || ($(location).attr('pathname').indexOf("/details")!= -1)){
        var search_word = $('#search_word').val()
        window.location.href = '/index.html?s='+search_word;
      }
      else{
        sendSearchRequest()
      }
  }
}
