import { SearchClient } from "algoliasearch"

export class AlgoliaHelper {
    static async clearAll(client: SearchClient) {
        const indices = await client.listIndices()

        const { primaryOps, replicaOps } = indices.items.reduce(
            (acc, cur) => {
                acc[(cur as any)['primary'] ? 'primaryOps' : 'replicaOps'].push({
                    indexName: cur.name,
                    action: 'delete',
                });
                return acc
            },
            { 
                primaryOps: new Array<{indexName: String, action: string}>(),
                replicaOps: new Array<{indexName: String, action: string}>()
            }
        )

        console.log('primaryOps', primaryOps)
        console.log('replicaOps', replicaOps)

        try {
            await client.multipleBatch(primaryOps as any)
        } catch(err) {
            throw new Error(err)
        }

        try {
            await client.multipleBatch(replicaOps as any)
        } catch(err) {
            throw new Error(err)
        }
        
        console.log('# All indexes cleared...')
    }
}