package com.tesobe.api

import net.liftweb.common.{Full,Box,Loggable}
import net.liftweb.http.js.JsExp
import net.liftweb.http.{JsonResponse,S}
import net.liftweb.http.rest._
import net.liftweb.json.Extraction
import net.liftweb.json.JsonAST.JValue
import net.liftweb.json.parse
import net.liftweb.json.Serialization.write
import net.liftweb.util.Helpers
import org.json._
import dispatch._, Defaults._
import scala.concurrent.Await
import scala.concurrent.duration._


case class APIResponse(code: Int, body: JValue)

object SearchAPI extends RestHelper with Loggable {
  serve {
    case "search" :: Nil JsonGet json => {
      val query: Box[Map[String, List[String]]] = S.request.map(_.params)
      val queryString = query.map{
        m => {
          val queryParamsList = m.map{
            case (k, v) => k+"="+Helpers.urlEncode(v.mkString)
          }
          queryParamsList.mkString("&")
        }
      }
      val request =
        url("http://localhost:9200/_search?"+queryString.getOrElse(""))
        .GET
      val response = getAPIResponse(request)
    JsonResponse(response.body,("Access-Control-Allow-Origin","*") :: Nil, Nil, response.code)
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

