using log4net;
using Microsoft.Azure.Documents;
using Microsoft.Azure.Documents.Client;
using Newtonsoft.Json;
using System;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace PP2.Server.Dal
{
	public class DocumentDBFactory
	{
		public DocumentDBFactory()
		{
			this.authorizationKey = ConfigurationManager.AppSettings["AccountKey"];
			this.endpointUrl = ConfigurationManager.AppSettings["AccountEndpoint"];
			this.client = new Lazy<DocumentClient>(Initialize, LazyThreadSafetyMode.ExecutionAndPublication);
		}

		//public DocumentDBFactory(string endpointUrl, string authorizationKey)
		//{
		//	this.authorizationKey = authorizationKey;
		//	this.endpointUrl = endpointUrl;
		//	this.client = new Lazy<DocumentClient>(Initialize, LazyThreadSafetyMode.ExecutionAndPublication);
		//}

		private string endpointUrl;
		private string authorizationKey;
		private Lazy<DocumentClient> client;

		private DocumentClient Initialize()
		{
			var client = new DocumentClient(new Uri(endpointUrl), authorizationKey);
			return client;
		}

		public async Task<ResourceResponse<Database>> CreateDbIfNotExists(string dbName)
		{
			ResourceResponse<Database> response = null;
			try
			{
				response = await client.Value.ReadDatabaseAsync(UriFactory.CreateDatabaseUri(dbName));
			}
			catch (DocumentClientException de)
			{
				if (de.StatusCode == HttpStatusCode.NotFound)
				{
					response = await client.Value.CreateDatabaseAsync(new Database { Id = dbName });
				}
				else
				{
					throw;
				}
			}
			return response;
		}

		public async void CreateCollectionIfNotExists(string dbName, string collectionName)
		{
			try
			{
				await client.Value.ReadDocumentCollectionAsync(UriFactory.CreateDocumentCollectionUri(dbName, collectionName));
			}
			catch (DocumentClientException de)
			{
				// If the document collection does not exist, create a new collection
				if (de.StatusCode == HttpStatusCode.NotFound)
				{
					// Configure the collection. Optionally, you can configure partitioning and indexing behavior of the collection here.
					DocumentCollection collectionInfo = new DocumentCollection();
					collectionInfo.Id = collectionName;

					// DocumentDB collections can be reserved with throughput specified in request units/second. 
					// 1 RU is a normalized request equivalent to the read of a 1KB document.
					// Here we create a collection with 400 RU/s. 
					await client.Value.CreateDocumentCollectionAsync(
						UriFactory.CreateDatabaseUri(dbName),
						new DocumentCollection { Id = collectionName },
						new RequestOptions { OfferThroughput = 400 });
				}
				else
				{
					throw;
				}
			}
		}

		public async Task<DocumentDb> CreateDB(string dbName)
		{
			return await CreateDB(dbName, true);
		}

		public async Task<DocumentDb> CreateDB(string dbName, bool createIfNotExists)
		{
			if (createIfNotExists)
				await CreateDbIfNotExists(dbName);
			return new DocumentDb(this.client.Value, dbName);
		}
	}

	public interface IDocument
	{
		[JsonProperty(PropertyName = "id")]
		string id { get; set; }
	}

	public class DocumentDb
	{
		private ILog log = LogManager.GetLogger(typeof(DocumentDb));

		private string dbName;
		private DocumentClient client;

		internal DocumentDb(DocumentClient client, string dbName)
		{
			this.client = client;
			this.dbName = dbName;
		}

		public async Task SaveDocumentAsync<T>(string collectionId, T document) where T : IDocument
		{
			try
			{
				await this.client.ReplaceDocumentAsync(UriFactory.CreateDocumentUri(this.dbName, collectionId, document.id), document);
			}
			catch (DocumentClientException de)
			{
				if (de.StatusCode == HttpStatusCode.NotFound)
				{
					await this.client.CreateDocumentAsync(UriFactory.CreateDocumentCollectionUri(this.dbName, collectionId), document);
				}
				else
				{
					log.ErrorFormat("exception: {0}, stacktrace: {1}", de.Message, de.StackTrace);
					throw;
				}
			}
		}

		public async Task InsertDocumentAsync<T>(string collectionId, T document) where T : IDocument
        {
			try
			{
				await this.client.CreateDocumentAsync(UriFactory.CreateDocumentCollectionUri(this.dbName, collectionId), document);
			}
			catch (DocumentClientException de)
			{
				log.ErrorFormat("exception: {0}, stacktrace: {1}", de.Message, de.StackTrace);
				throw;
			}
		}

		public IQueryable<T> CreateQuery<T>(string collectionId)
		{
			var self = UriFactory.CreateDocumentCollectionUri(this.dbName, collectionId);
			return client.CreateDocumentQuery<T>(self);
		}
	}
}