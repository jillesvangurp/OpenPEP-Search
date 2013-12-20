package org.tesobe.openpep

import net.liftweb.util.Props
import org.elasticsearch.action.admin.indices.create.CreateIndexRequest
import org.elasticsearch.common.settings.ImmutableSettings
import org.elasticsearch.client.Client
import org.elasticsearch.node.NodeBuilder.nodeBuilder
import org.json.JSONArray
import scala.io.Source

object Upload {

  def main(args : Array[String]) {
    val node = nodeBuilder().client(true).node()
    val client = node.client()

    def createIndexWithProperties(indexName: String) = {
      val indexRequest = new CreateIndexRequest(indexName)
      indexRequest.settings(ImmutableSettings.settingsBuilder().put("index.number_of_shards", 13).put("index.number_of_replicas", 1).build())
      client.admin().indices().create(indexRequest).actionGet()
    }

    def getJson {
      val json = CSV2Json.convert
      json match {
        case Some(converted) =>
          createESDocuments(Props.get("es_index", "people"), Props.get("es_type", "person"), converted)
        case None => {
          println("Converting CSV to JSON failed.")
        }
      }
    }

    def createESDocuments (es_index: String, es_type: String, json: JSONArray){
      createIndexWithProperties(es_index)

      // val bulkJson = Source.fromFile(getJson).getLines().toList
      var bulkJson: List[String] = Nil
      for(i <- 0 to json.length-1 ){
        bulkJson = bulkJson :+ json.get(i).toString
      }

      val bulkRequest = client.prepareBulk()
      // in for loop we are adding  prepareindex call to bulkRequest for each json
      bulkJson.zipWithIndex.foreach{
        line => bulkRequest.add(client.prepareIndex(es_index, es_type, line._2.toString).setSource(line._1))
      }

      // execute bulkRequest
      bulkRequest.execute().actionGet()
      client.close()
    }

    getJson
  }
}
