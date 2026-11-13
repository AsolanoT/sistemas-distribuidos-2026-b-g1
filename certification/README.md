# Certification C3 — Angel Gustavo Solano Trujillo

> Template of the corte 3 certification. Replace every `<...>` with your data and delete this note. The rules are in the guide attached to the c3-certification activity in Moodle. Text left as `<...>` counts as missing.

## Cover

| Field | Value |
|---|---|
| Full name | Angel Gustavo Solano Trujillo |
| GitHub user | AsolanoT |
| Group | G1 |
| Team | synkro-tech |
| Team -docs repository | https://github.com/code-corhuila/synkro-docs |
| Course | HCCDP-Solution Architectures Course |
| Course link | https://e.huawei.com/en/talent/outPage/#/sxz-course/home?courseId=I4bs1u--tD4kL8Fg3clrbgvqnhA&pageType=learn&operate=1 |
| Start date | 2026-11-01 |
| Completion date | PENDIENTE (faltan labs y examen final) |

## Study log

| Date | Hours | Chapters or labs | Evidence file |
|---|---|---|---|
| 2026-11-01 | PENDIENTE | Enrollment | evidence/00-enrollment.png |
| 2026-11-02 | PENDIENTE | Chapters 1-6 | evidence/01-chapter-01.png |
| 2026-11-07 | PENDIENTE | Chapters 7-8 | evidence/07-chapter-07.png |
| 2026-11-08 | PENDIENTE | Chapters 9-11 | evidence/09-chapter-09.png |
| 2026-11-10 | PENDIENTE | Chapters 12-14 | evidence/12-chapter-12.png |
| PENDIENTE | PENDIENTE | Lab 1 | evidence/15-lab-1.png |
| PENDIENTE | PENDIENTE | Lab 2 | evidence/16-lab-2.png |
| PENDIENTE | PENDIENTE | Lab 3 | evidence/17-lab-3.png |
| PENDIENTE | PENDIENTE | Lab 4 | evidence/18-lab-4.png |
| PENDIENTE | PENDIENTE | Final exam | evidence/19-final-exam.png |
| Total | PENDIENTE (debe quedar entre 50 y 60) | | |

## Labs

| Evidence file | Lab name | What I built | What failed first and how I fixed it |
|---|---|---|---|
| evidence/15-lab-1.png | <Lab name> | <One sentence> | <One sentence> |
| evidence/16-lab-2.png | <Lab name> | <One sentence> | <One sentence> |
| evidence/17-lab-3.png | <Lab name> | <One sentence> | <One sentence> |
| evidence/18-lab-4.png | <Lab name> | <One sentence> | <One sentence> |

## Final exam

- Score: <score>
- Date: <YYYY-MM-DD>
- Evidence: evidence/19-final-exam.png

## Skills summary

> ⚠️ BORRADOR — léelo, corrígelo y reescríbelo con tus propias palabras antes de dejarlo en el repo. Si lo subes tal cual, corres riesgo con la regla N7 (firma de IA / no es tu voz).

I learned to apply the AKF Scale Cube to decide whether a service should scale along the X axis (cloning), the Y axis (splitting by function into microservices), or the Z axis (partitioning data by region or tenant), instead of just "adding more servers." I practiced configuring Auto Scaling with both alarm-based policies (tied to a real metric like CPU usage) and scheduled policies for predictable traffic, and learned to size minimum and maximum instance counts around a measurable threshold rather than a guess. I used Infrastructure as Code with Huawei's Resource Formation Service (RFS) to describe VPCs, subnets, and compute resources as versioned, repeatable templates instead of manual console clicks. For resilience, I compared cold-standby, hot-standby, active-active, and two-city-three-center disaster recovery patterns, and learned to express their trade-offs quantitatively through RTO (how fast) and RPO (how much data lost) instead of vague adjectives like "reliable." I also picked up the idea of blast-radius control in chaos engineering: before injecting any fault, you scope how far the damage could spread. Finally, connecting container orchestration (CCE/CCI) with CI/CD pipelines (CodeArts) showed me how automated build-test-deploy-rollback stages reduce the risk that comes from manual, repetitive releases.
