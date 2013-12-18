function displayData(data) {
    $('#display').addClass('displayResults')
    $('#display').html("")
    // $('#display').append("Results: "+data.total)
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
      // $('#display').append("</table>");
      enableClick(data.hits)
    }
    else{
      $('#display').append('<p class="not-found">I looks like we haven\'t found <br/><b>'+$('#search_word').val()+'</b> in our database.<p>')
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

//nicer: (and then use data: JSON.stringify(search_json) in ajax-function)
  // var search_json = {
  //   "query" : {
  //     "multi_match" : {
  //       "query" : ""+$('#search_word')+"",
  //       "fields" : getNameArray()
  //     }
  //     "match" : {
  //       "Country of residence" : ""+$('#residence')+""
  //     },
  //     "match" : {
  //       "Country of Citizenship" : ""+$('#citizenship')+""
  //     }
  //   }
  // }

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
  // birthday data currently missing
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
    if(($(location).attr('pathname').indexOf("/about") != -1) || ($(location).attr('pathname').indexOf("/details")!= -1)){
      var search_word = $('#search_word').val()
      window.location.href = '/index.html?s='+search_word;
    }
    else{
      sendSearchRequest()
    }
   })
})

function sendSearchRequest(){
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/search",
    data: createSearchJson(),
    success: function(data){
      displayData(data.hits)
    },
    dataType: "json",
    contentType:'application/json'
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
    // $(location).attr('search',"")
  }
  else if($(location).attr('pathname').indexOf("/details")!= -1){
    noDetailsFor("no id")
  }
}

function getIdDetailsFor(id){
  $.ajax({
    type: "POST",
    url: "http://localhost:8080/search",
    data: '{"query":{"bool":{"must":{"match":{"Register":"'+id+'"}}}}}',
    success: function(data){
      if(data.hits.total > 0){
        fillDetailPage(data.hits.hits[0])
      }
      else{
        noDetailsFor(id)
      }
    },
    dataType: "json",
    contentType:'application/json'
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
  // $('.displayDetails').append('<p class="not-found">No details found.</p>')
  $('.displayDetails').append('<p class="not-found">No details for id <b>'+id+'</b> found.</p>')
}
