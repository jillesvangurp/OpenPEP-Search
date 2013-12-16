package com.tesobe.api

import net.liftweb.common.{Full, Loggable}
import net.liftweb.http.js.JsExp
import net.liftweb.http.JsonResponse
import net.liftweb.http.rest._
import net.liftweb.json.Extraction
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.parse
import net.liftweb.json.Serialization.write
import org.json._
import dispatch._, Defaults._
import scala.concurrent.Await
import scala.concurrent.duration._


case class APIResponse(code: Int, body: JValue)

object SearchAPI extends RestHelper with Loggable {
  serve {
    case "search" :: Nil JsonPost jsonBody -> _ => {
      val request =
        url("http://localhost:9200/_search")
        .addHeader("Content-Type", "application/json")
        .setBody(write(jsonBody))
        .POST
      val response = getAPIResponse(request)
    JsonResponse(response.body,("Access-Control-Allow-Origin","*") :: Nil, Nil, 200)
    }
  }

  private def getAPIResponse(req : Req) : APIResponse = {
    Await.result(
      for(response <- Http(req > as.Response(p => p)))
      yield
      {
        val body = if(response.getResponseBody().isEmpty) "{}" else response.getResponseBody()
        APIResponse(response.getStatusCode, parse(body))
      }
    , Duration.Inf)
  }

}

