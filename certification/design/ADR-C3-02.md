# ADR-C3-02: Cloud-Eye-driven Auto Scaling for `synkro-products-api` and `synkro-api-gateway`

## Status

Accepted

## Context

`04-requirements/non-functional.md` (NFR-001, Performance) lists the minimum throughput and maximum RPS as not yet defined and states that no capacity planning has been done for this academic project. At the same time, `01-context/overview.md` already justifies building `synkro-products-api` in Go specifically because of its "high-frequency reads" on every sale, and `05-architecture/overview.md` §9 (AT-004) separately flags `synkro-api-gateway` as the only entry point, so if it stops the system is unreachable from outside. Section 3 of this certification's design note proposes concrete scaling thresholds for exactly these two services; this ADR records the decision behind that proposal.

## Decision

We will configure Huawei Cloud Auto Scaling, driven by Cloud Eye alarm policies, for `synkro-products-api` (CPU > 70% for 5 minutes, 2–6 instances) and `synkro-api-gateway` (> 500 requests/second for 3 minutes, 2–4 instances). Both groups keep a minimum of 2 instances split across AZ1 and AZ2, so scaling also closes part of AT-004: the gateway is never reduced to a single running instance.

## Alternatives considered

- **Fixed-size ECS instances sized for an estimated peak:** rejected because NFR-001 explicitly says no real traffic estimate exists for this academic project — any fixed size would be a guess, and it would keep the AT-004 single-instance gateway risk unless a second idle instance were kept running all the time at extra cost.
- **Scheduled (time-based) scaling instead of alarm-based:** rejected for these two services because our own traffic has no known daily pattern to schedule against (unlike, for example, a retail promotion); alarm-based policies react to the actual metric instead of a guessed schedule.

## Consequences

- Positive: `synkro-products-api` and `synkro-api-gateway` absorb load spikes without manual intervention, and the gateway's AT-004 single-point-of-failure risk is reduced because it never runs below 2 instances.
- Negative: Auto Scaling adds a new class of failure mode that the team has not operated before — a misconfigured alarm threshold could either scale too late (defeating the purpose) or scale too aggressively (increasing cost), and this needs the centralized Cloud Eye / LTS observability proposed in §2 of the design note to be monitored properly.
