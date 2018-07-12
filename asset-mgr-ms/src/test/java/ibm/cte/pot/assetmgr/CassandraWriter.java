package ibm.cte.pot.assetmgr;

import org.springframework.data.cassandra.core.CassandraOperations;
import org.springframework.data.cassandra.core.CassandraTemplate;

import com.datastax.driver.core.Cluster;
import com.datastax.driver.core.Session;
import com.datastax.driver.core.querybuilder.QueryBuilder;
import com.datastax.driver.core.querybuilder.Select;

import ibm.cte.pot.assetmgr.model.Asset;

/**
 * Test writing and reading assets to cassandra
 * @author jerome boyer
 *
 */
public class CassandraWriter {

	 private static Cluster cluster; 
	 private static Session session; 
	 
	 public static void main(String[] args) { 
	 
	  try { 
		   cluster = Cluster.builder().addContactPoints("localhost").build();  
		   session = cluster.connect("assetmonitoring"); 
		   CassandraOperations cassandraOps = new CassandraTemplate(session); 
		   cassandraOps.insert(new Asset("1","IOS", "iphone" )); 
		   cassandraOps.insert(new Asset("2","raspbian", "raspberry Pi 3" )); 
		   cassandraOps.insert(new Asset("3","raspbian", "raspberry Pi 3" )); 
		   cassandraOps.insert(new Asset("4","raspbian", "raspberry Pi 3" )); 
		   Select s = QueryBuilder.select().from("assets"); 
		   s.where(QueryBuilder.eq("id", "4")); 
		   Asset a = cassandraOps.selectOne(s, Asset.class);
		   System.out.println("Asset read:"+ a.getOs()); 
	 
	       // cassandraOps.truncate("assets"); 
		   session.close();
		   cluster.close();
	  } catch (Exception e) { 
	      e.printStackTrace(); 
	  } 
	 
	 } 
}