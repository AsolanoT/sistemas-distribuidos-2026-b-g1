# Certification C3 — Angel Gustavo Solano Trujillo

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
| Completion date | 2026-11-13 |

**Note about the name on the certificate.** The original `certificate.pdf` shows my Huawei Talent account ID (`idaas_11c60f615b`) instead of my name, because the platform prints the account ID and offers no option to edit it. To show that the certificate is mine, the screenshot [evidence/20-account-id-name-mismatch-proof.png](evidence/20-account-id-name-mismatch-proof.png) shows my Huawei Talent profile with the account `idaas_11c60f615b` and my full name, ANGEL GUSTAVO SOLANO TRUJILLO (taken 2026-11-13, 4:59 p. m.). On 2026-11-13 I also sent a request to Huawei support (Huawei Talent, Submit the Case) asking them to change the name on my account and reissue the certificate. The certificate file was not edited.

## Study log

| Date | Hours | Chapters or labs | Evidence file |
|---|---|---|---|
| 2026-11-01 | 2.5 | Enrollment + Pre-class Guidance | [evidence/00-enrollment.png](evidence/00-enrollment.png) |
| 2026-11-02 | 1 | Chapter 1: Architecture Design Methodology on Huawei Cloud | [evidence/01-chapter-01.png](evidence/01-chapter-01.png) |
| 2026-11-02 | 1 | Chapter 2: Typical Service Implementation Solutions on the Cloud | [evidence/02-chapter-02.png](evidence/02-chapter-02.png) |
| 2026-11-02 | 1 | Chapter 3: Cloud Compute Solution Design | [evidence/03-chapter-03.png](evidence/03-chapter-03.png) |
| 2026-11-02 | 1 | Chapter 4: Cloud Storage Solution Design | [evidence/04-chapter-04.png](evidence/04-chapter-04.png) |
| 2026-11-02 | 1 | Chapter 5: Cloud Network Solution Design | [evidence/05-chapter-05.png](evidence/05-chapter-05.png) |
| 2026-11-02 | 1 | Chapter 6: Cloud Database Solution Design | [evidence/06-chapter-06.png](evidence/06-chapter-06.png) |
| 2026-11-06 | 4 | Reading synkro-docs (overview, AT-002, AT-004, NFR-001, ADR-009) to pick the design problems | [evidence/06-chapter-06.png](evidence/06-chapter-06.png) |
| 2026-11-07 | 3.5 | Chapter 7: Cloud Security Solution Design | [evidence/07-chapter-07.png](evidence/07-chapter-07.png) |
| 2026-11-07 | 2.5 | Chapter 8: Cloud O&M Solution Design | [evidence/08-chapter-08.png](evidence/08-chapter-08.png) |
| 2026-11-08 | 2 | Chapter 9: Distributed Architecture Design | [evidence/09-chapter-09.png](evidence/09-chapter-09.png) |
| 2026-11-08 | 1.5 | Chapter 10: Highly Scalable System Design | [evidence/10-chapter-10.png](evidence/10-chapter-10.png) |
| 2026-11-08 | 1.5 | Chapter 11: Disaster Recovery System Design | [evidence/11-chapter-11.png](evidence/11-chapter-11.png) |
| 2026-11-08 | 1 | Chapter 12: Automated Deployment | [evidence/12-chapter-12.png](evidence/12-chapter-12.png) |
| 2026-11-09 | 4.5 | Outline of the design note and mapping of components to synkro-docs | [evidence/12-chapter-12.png](evidence/12-chapter-12.png) |
| 2026-11-10 | 3 | Chapter 13: Containers and Agility | [evidence/13-chapter-13.png](evidence/13-chapter-13.png) |
| 2026-11-10 | 3 | Chapter 14: Huawei Cloud Advanced Services | [evidence/14-chapter-14.png](evidence/14-chapter-14.png) |
| 2026-11-11 | 6 | Writing the design note and drawing the target architecture diagram | [evidence/14-chapter-14.png](evidence/14-chapter-14.png) |
| 2026-11-12 | 1.5 | Final exam | [evidence/19-final-exam.png](evidence/19-final-exam.png) |
| 2026-11-12 | 2.5 | Writing ADR-C3-01 and ADR-C3-02 | [evidence/19-final-exam.png](evidence/19-final-exam.png) |
| 2026-11-13 | 1.5 | Lab 1: Design Cases and Practices of an O&M Solution | [evidence/15-lab-1.png](evidence/15-lab-1.png) |
| 2026-11-13 | 1 | Lab 2: High-Performance Network Solution | [evidence/16-lab-2.png](evidence/16-lab-2.png) |
| 2026-11-13 | 1 | Lab 3: Highly Elastic Service System | [evidence/17-lab-3.png](evidence/17-lab-3.png) |
| 2026-11-13 | 0.5 | Lab 4: Highly Reliable Database Solution | [evidence/18-lab-4.png](evidence/18-lab-4.png) |
| 2026-11-13 | 2 | Final review of README, design note, ADRs and certificate | [evidence/18-lab-4.png](evidence/18-lab-4.png) |
| Total | 51 | | |

## Labs

| Evidence file | Lab name | What I built (one sentence) | What failed first and how I fixed it (one sentence) |
|---|---|---|---|
| evidence/15-lab-1.png | Design Cases and Practices of an O&M Solution | I created the `subnet-web` network of `vpc-primary` (192.168.0.0/24) and reviewed it in the VPC console of the sandbox account. | The remote lab desktop did not react at first, so I reloaded the Exercise Interface and logged in to the console again. |
| evidence/16-lab-2.png | High-Performance Network Solution | I opened the Virtual Private Cloud console and checked the two VPCs of the lab, `vpc-primary` and a second VPC for the peering connection. | I opened the tutorial picture instead of the console by mistake, so I closed it and entered through the Exercise Interface icon. |
| evidence/17-lab-3.png | Highly Elastic Service System | I configured the security group `sg-db` and edited its inbound rules in the VPC console. | The rule did not save the first time because I left the inline editor open, so I confirmed the change and checked the rule list again. |
| evidence/18-lab-4.png | Highly Reliable Database Solution | I logged in to the sandbox console that holds the RDS, DRS and DCS resources of the lab. | A console notice covered the page after login, so I dismissed it and opened the service list to confirm the lab resources were available. |

## Final exam

- Score: 85 points (26/30 closed-ended questions correct, passed)
- Date: 2026-11-12
- Evidence: [evidence/19-final-exam.png](evidence/19-final-exam.png)

## Skills summary

- I learned to use the AKF Scale Cube to decide if a service should scale on the X axis (cloning), the Y axis (splitting by function) or the Z axis (partitioning data).
- I practiced Auto Scaling with alarm-based policies tied to a real metric like CPU usage, and with scheduled policies for predictable traffic, setting minimum and maximum instances from a measurable threshold.
- I used Infrastructure as Code with Resource Formation Service (RFS) to describe VPCs, subnets and servers as versioned templates instead of manual console clicks.
- I compared cold standby, hot standby, active-active and two-city three-center disaster recovery, and learned to justify each one with RTO and RPO numbers.
- I learned blast-radius control from chaos engineering: before injecting a fault, define how far the damage can spread and how to roll it back.
- I connected container services (CCE, CCI, SWR) with a CodeArts pipeline to see how automated build, test, deploy and rollback stages reduce the risk of manual releases.
