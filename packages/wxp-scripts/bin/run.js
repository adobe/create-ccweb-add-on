#!/usr/bin/env node

import oclif from "@oclif/core";

await oclif
    .execute({ dir: import.meta.url })
    .then(oclif.flush)
    .catch(oclif.Errors.handle);
