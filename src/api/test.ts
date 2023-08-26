import {ping} from './api'
import { Context } from './context'

const c = new Context({'scene': 'string'})
ping(c)