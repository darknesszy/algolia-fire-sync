import { inject, injectable } from "inversify"
import algoliasearch, { SearchClient } from 'algoliasearch'
import { firestore } from "firebase-admin"
import { FirestoreClient } from "../clients"
import { AlgoliaHelper } from "../utils/algolia-helper"

@injectable()
export class ProductETL {
    private algoliaClient: SearchClient
    @inject(FirestoreClient) private firestoreClient!: FirestoreClient

    private collectionRef?: firestore.CollectionReference
    private batch?: any[]

    constructor() {
        this.algoliaClient = algoliasearch(process.env['APPLICATION_ID']!, process.env['ADMIN_API_KEY']!)
    }

    async syncToAlgolia(indexName: string) {
        await AlgoliaHelper.clearAll(this.algoliaClient)
        this.collectionRef = this.firestoreClient.connect().collection('product')
        this.batch = new Array<any>()

        const snapshots = await this.collectionRef.get()
        for await (let doc of snapshots.docs) {
            let document = doc.data()
            document['price'] != 0 && this.batch.push(this.createProduct(document, indexName))
        }
        
        try {
            const { objectIDs } = await this.algoliaClient.multipleBatch(this.batch)
            console.log('tester', objectIDs)
        } catch(err) {
            throw new Error(err)
        }
    }

    createProduct(document: firestore.DocumentData, indexName: string) {
        return {
            action: 'addObject',
            indexName: indexName,
            body: {
                name: document['name'],
                description: document['description'],
                price: document['price']
            }
        }
    }
}