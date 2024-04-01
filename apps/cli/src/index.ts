#!/usr/bin/env node

import { runMain } from 'citty'
import { main } from './main'

runMain(main).then(() => process.exit(0)).catch(() => process.exit(1))
