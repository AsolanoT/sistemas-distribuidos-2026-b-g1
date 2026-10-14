# WKF-16 functional acceptance reconciliation handoff

Existing owner story verified OPEN: [HU-WKF-03 #243](https://github.com/code-corhuila/synkro-docs/issues/243). Workflow selected merge 45aa244251851fda46212c5b6338668daaa683be; Customers API selected merge 58a0ef9f6fc05b788b2e65002468cd9c14783540. No story/source/documentation change was performed outside infrastructure.

[Exact evidence](evidence/final-acceptance-2026-10-12/workflow-real.json), root 4a4d976ac57868c2a7e4935ee7820d388e996cc3, executes all actual HTTP/database participants and approved owning migrations. Actual Auth issues caller/SERVICE tokens. Active sale, inactive/missing rejection with no stock/sale/reservation effects, equivalent replay with same saga/effects, confirmed Sales rejection and real stock compensation, completed-state restart and in-flight Workflow crash/Sales pause recovery all passed. Recovery leaves one additional sale and exactly one reservation for that saga. Cleanup passed; no secret/raw diagnostic/private fixture was published.

The previous Customers 501 blocker is superseded by reviewed Customers #3–#7 and this real functional run. Original failed extension is retained; random endpoint refresh correction is fixture-only (restartEndpointChanged=true). Products selected revision still has bearer-shape authorization limitations; do not label this evidence security approval. Business functional evidence does not replace owner review, documentation or full HU-INF-02 composition.

Owner action: review exact evidence against WKF-16, record reconciliation in the authorized Workflow/story/documentation process, retain security caveats and remaining DoD gates. This task neither closes #243/#239 nor publishes that external update.
