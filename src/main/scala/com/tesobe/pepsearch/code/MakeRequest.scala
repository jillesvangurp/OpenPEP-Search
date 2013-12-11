// /**
// Open Bank Project - API
// Copyright (C) 2011, 2013, TESOBE / Music Pictures Ltd

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Email: contact@tesobe.com
// TESOBE / Music Pictures Ltd
// Osloerstrasse 16/17
// Berlin 13359, Germany

//   This product includes software developed at
//   TESOBE (http://www.tesobe.com/)
//   by
//   Simon Redfern : simon AT tesobe DOT com
//   Stefan Bethge : stefan AT tesobe DOT com
//   Everett Sochowski : everett AT tesobe DOT com
//   Ayoub Benali: ayoub AT tesobe DOT com

//  */

// package come.tesobe.code

// // import org.scalatest._
// // import dispatch._, Defaults._
// // import net.liftweb.json.NoTypeHints
// import net.liftweb.json.JsonAST.{JValue, JObject}
// // import _root_.net.liftweb.json.Serialization.write
// // import net.liftweb.json.parse
// // import net.liftweb.common._
// // import org.mortbay.jetty.Connector
// import org.mortbay.jetty.Server
// // import org.mortbay.jetty.nio.SelectChannelConnector
// // import org.mortbay.jetty.webapp.WebAppContext
// // import net.liftweb.json.Serialization
// // import org.junit.runner.RunWith
// // import net.liftweb.mongodb._
// // import net.liftweb.util.Props
// // import code.model.dataAccess._
// // import java.util.Date
// // import _root_.net.liftweb.util._
// // import Helpers._
// import scala.concurrent.duration._
// import scala.concurrent.Await
// import net.liftweb.http

// case class APIResponse(code: Int, body: JValue)

// val server = ServerSetup
// val h = Http
// def baseRequest = host(server.host, server.port)


// private def getAPIResponse(req : Req) : APIResponse = {
//   Await.result(
//     for(response <- Http(req > as.Response(p => p)))
//     yield
//     {
//       val body = if(response.getResponseBody().isEmpty) "{}" else response.getResponseBody()
//       APIResponse(response.getStatusCode, parse(body))
//     }
//   , Duration(5, SECONDS))
// }


// def makeGetRequest(req: Req) : APIResponse = {
//   val jsonReq = req.GET
//   getAPIResponse(jsonReq)
// }

// object ServerSetup {
//   val host = "localhost"
//   val port = 9200
//   val server = new Server
//   val scc = new SelectChannelConnector
//   scc.setPort(port)
//   server.setConnectors(Array(scc))

//   server.addHandler(context)

//   server.start()
// }