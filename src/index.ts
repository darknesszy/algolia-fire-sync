import 'reflect-metadata'
import dotenv from 'dotenv'
import { Container } from 'inversify'
import { FirestoreClient } from './clients'
import { ProductETL } from './product'

// Setup environment variables
const result = dotenv.config()
if (!result.error) console.log('Environment Variables from .env is used')

const serviceProvider = new Container()
serviceProvider.bind<FirestoreClient>(FirestoreClient).toSelf().inSingletonScope()
serviceProvider.bind<ProductETL>(ProductETL).toSelf().inTransientScope()

console.log('# Running Algolia FireSync...')

const productEtl = serviceProvider.resolve(ProductETL)
productEtl.syncToAlgolia(process.env['TEST_INDEX_NAME']!)