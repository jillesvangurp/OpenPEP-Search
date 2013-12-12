package com.tesobe.api

import net.liftweb.http._
import js.JsExp
import net.liftweb.http.rest._
import net.liftweb.http.JsonResponse
import net.liftweb.json.Extraction
import net.liftweb.common.Loggable

import org.json.JSONObject
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.Client
import org.elasticsearch.index.query.FilterBuilders._;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.node.NodeBuilder.nodeBuilder

object SearchAPI extends RestHelper with Loggable {
  serve {
    case "es" :: "search" :: search_words :: _ JsonGet _ => {
      var search_string = ""
      val search_word_array = search_words.split(" ")
      for (word <- search_word_array){
        search_string += " +"+word
      }
      val node = nodeBuilder().client(true).node()
      val client = node.client()
      val response: SearchResponse = client.prepareSearch("people")
      .setTypes("person")
      //accurate search:
      .setQuery(QueryBuilders.queryString(search_string).field("First Name").field("Middle Name").field("Last Name"))
      //fuzzy search:
      // .setQuery(QueryBuilders.multiMatchQuery(search_words,"First Name", "Middle Name", "Last Name"))
      .execute()
      .actionGet();
      val hitFields = new JSONObject(response.toString)
      val hitsJson = hitFields.getJSONObject("hits")
      object json extends JsExp{
        def toJsCmd = hitsJson.toString
      }
      JsonResponse(json,("Access-Control-Allow-Origin","*") :: Nil, Nil, 200)
    }
  }
}

