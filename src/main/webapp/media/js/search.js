function displayData(data) {
    $('#display').addClass('displayResults')
    $('#display').html("")
    // $('#display').append("Results: "+data.total)
    if (data.total > 0){
      $('#display').append("<table id='resultTable'><tr><th>First</th><th>Middle</th><th>Surname</th><th>Position</th><th>Nationality</th><th>Residence</th></tr></table>")
      $.each(data.hits, function(i, person) {
        $('#resultTable').append("<tr id='personRow"+i+"'></tr>")
        $('#personRow'+i).append("<td class='personRow' name="+i+">"+person._source["First Name"]+"</td>")
        $('#personRow'+i).append("<td>"+person._source["Middle Name"]+"</td>")
        $('#personRow'+i).append("<td>"+person._source["Last Name"]+"</td>")
        $('#personRow'+i).append("<td>"+person._source["Position"]+"</td>")
        $('#personRow'+i).append("<td>"+person._source["Country of Citizenship"]+"</td>")
        $('#personRow'+i).append("<td>"+person._source["Country of residence"]+"</td>")
      })
      $('#display').append("</table>");
    }
    enableDoubleClick(data.hits)
  }

  function enableDoubleClick(hits) {
    $(".personRow" ).dblclick(function() {
      // console.log(hits[$(this).attr("name")])
      console.log(hits[$(this).attr("name")]._source["First Name"])
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
  $("#searchBtn").click(function() {
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
   })
})