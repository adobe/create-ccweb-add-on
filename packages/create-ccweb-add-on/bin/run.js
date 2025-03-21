#!/usr/bin/env node

import oclif from "@oclif/core";
import url from "url";

await oclif
    .execute({ dir: url.fileURLToPath(import.meta.url) })
    .then(oclif.flush)
    .catch(oclif.Errors.handle);
