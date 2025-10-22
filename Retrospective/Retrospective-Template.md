TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 
3/3
- Total points committed vs. done 
6/6
- Nr of hours planned vs. spent (as a team)
52/64h 5m



**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing

- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| Uncategorized      |     11    |   //    |     27h      |       35h 10m       |
| Get Ticket      |     6    |   3    |     9h      |       7h 45m       |
| Next Customer      |     6    |    2     |      7h       |      11h       |
| Call Customer      |     6    |    1     |      9h      |     10h 10m   |  

> story `Uncategorized` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |  1h48m   |    2h   | 
| Actual     |   2h 12m   |   3h 30m    |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

$$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0,23$$
        
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

$$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right|  = 0,461$$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 4h
  - Total hours spent: 3h 10m
  - Nr of automated unit test cases: 101 
  - Coverage
- E2E testing:
  - Total hours estimated: 2h
  - Total hours spent: 1h 30m
  - Nr of test cases: 35
- Code review 
  - Total hours estimated: 3h
  - Total hours spent: 1h 45m
  


## ASSESSMENT

- What did go wrong in the sprint?
  + Some tasks were not split into small enough sub-tasks and therefore took longer than expected.
  + The total estimated hours were less than 60 h.

- What caused your errors in estimation (if any)?
  + We underestimated the time needed for project setup (database, backend, frontend).
  + Did not consider time for bug fixing in estimation

- What lessons did you learn (both positive and negative) in this sprint?
  + It's better to overestimate the time required for tasks.
  + Split tasks into smaller sub-tasks.
  + Daily stand-ups help to track progress.

- Which improvement goals set in the previous retrospective were you able to achieve? 
  //
- Which ones you were not able to achieve? Why?
  //
- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  > Propose one or two
  + Try to split tasks into smaller sub-tasks more effectively now that we have more experience
  + Brainstorm as a team for the frontend design; collaborate on UI/UX to gather everyone's ideas
  

- One thing you are proud of as a Team!!
  + Despite all the difficulties, we managed to complete all committed stories on time and all team members contributed effectively to the sprint goals.