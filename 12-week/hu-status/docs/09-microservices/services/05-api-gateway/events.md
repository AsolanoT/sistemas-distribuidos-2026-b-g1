# Events — synkro-api-gateway

> Current adopted status: no broker events are published or consumed by this service.
> A scheduled callback, HTTP response, audit row or saga state is not broker delivery.

---

## Events this service PUBLISHES

| Event | Topic/Exchange | When it is emitted | Payload (key fields) |
|-------|---------------|--------------------|---------------------|
| None adopted | None | No broker publish path | No event schema introduced |

No event-schema sample is supplied because it could be mistaken for an implemented contract.

---

## Events this service CONSUMES

| Event | Published by | Topic/Exchange | What this service does when it receives it |
|-------|-------------|----------------|-------------------------------------------|
| None adopted | None | None | Real interactions use the documented synchronous HTTP/scheduler boundary |

---

## Delivery guarantees

| Guarantee | Value | Implication |
|-----------|-------|-------------|
| At-least-once | Not applicable | No broker subscription; HTTP replay/idempotency is separately specified |
| At-most-once | Not applicable | No broker delivery contract |
| Exactly-once | Not promised | No distributed exactly-once claim; own transactions/intent keys have bounded semantics |

---

## Error handling

No DLQ, topic, consumer retry loop or broker alert transport exists to configure. HTTP/application failures follow the applicable canonical contract and authentication boundary. Use the [service runbook](runbook.md) and [incident process](../../../13-operations/incident-management.md) for diagnosis; [decisions](decisions.md#consequences-and-unresolved-implementation) centralizes the implementation gaps for this service.

Broker/outbox is deferred under [ADR-007](../../../05-architecture/decisions/records/ADR-007-persistent-saga-and-scheduled-work.md) and [TD-002](../../../15-project-control/technical-backlog.md#td-002--message-broker-and-outbox-pattern), not a missing adopted event schema. A future consumer requirement needs its own reviewed adopting decision and downstream contracts.
