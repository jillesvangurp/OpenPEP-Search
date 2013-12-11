package com.tesobe.code

import net.liftweb.http._
import js.JsExp
import net.liftweb.http.rest._
import net.liftweb.http.JsonResponse
import net.liftweb.json.Extraction

import org.json.JSONObject
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.action.search.SearchType;
import org.elasticsearch.client.Client
import org.elasticsearch.index.query.FilterBuilders._;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.node.NodeBuilder.nodeBuilder

object SearchAPI extends RestHelper {
  serve {
    case "es" :: "search" :: search_word :: _ JsonGet _ => {
      val node = nodeBuilder().client(true).node()
      val client = node.client()
      val response: SearchResponse = client.prepareSearch("people")
      .setTypes("person")
      .setQuery(QueryBuilders.queryString(search_word))
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

