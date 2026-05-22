# DCOS Full Task Template Library
**Conversation Title:** Task Template  
**Revision:** R0  
**Purpose:** Standard task templates linked to each construction element code for auto-generation inside DCOS.
## 1. Standard Auto-Generation Rule
```text
Element Code + WBS Location + Quantity + Start Date
→ Load Task Template
→ Generate Task Group
→ Generate Step Tasks
→ Create Dependencies
→ Attach QA/QC Checklist
→ Attach Required Documents
→ Assign Responsible Role
```
## 2. Standard Template Fields
| Field | Meaning |
|---|---|
| Element Code | Code from element library |
| Discipline | STR / ARC / MEP |
| Template Name | Standard work package name |
| Phase | Design / Procurement / Construction / QA / Handover |
| Task Steps | Auto-generated child tasks |
| Dependencies | FS / SS / FF / SF relationship between steps |
| QA/QC Checklist | Inspection requirements before close |
| Required Documents | Drawings, method statement, ITP, test record |
| Deliverable | Definition of done |
| Risks | Key site/design risks to control |
## 3. Full Element Task Templates

---

# STR Task Templates

## STR-001 — Bored Pile
**Template Name:** Bored Pile Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piling drawing and coordinates
2. Survey setting out and mark pile position
3. Mobilize piling rig and prepare working platform
4. Execute drilling/driving/micropile installation
5. Install reinforcement/casing/grout as applicable
6. Place concrete or grout to approved level
7. Record installation data and as-built location
8. Carry out required pile testing
9. Submit pile record and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Piling rig / drilling machine
- Crane or lifting equipment
- Surveyor
- Concrete/grout supply
- QA/QC inspector

### QA/QC Checklist
- Check pile coordinates and cut-off level
- Verify depth/refusal/grout/concrete volume
- Inspect reinforcement cage or pile section
- Concrete slump/cube test where applicable
- Pile integrity/load test record accepted

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Bored Pile completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Pile deviation
- Bore collapse or obstruction
- Concrete/grout quality issue
- Testing failure

## STR-002 — Driven Pile
**Template Name:** Driven Pile Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piling drawing and coordinates
2. Survey setting out and mark pile position
3. Mobilize piling rig and prepare working platform
4. Execute drilling/driving/micropile installation
5. Install reinforcement/casing/grout as applicable
6. Place concrete or grout to approved level
7. Record installation data and as-built location
8. Carry out required pile testing
9. Submit pile record and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Piling rig / drilling machine
- Crane or lifting equipment
- Surveyor
- Concrete/grout supply
- QA/QC inspector

### QA/QC Checklist
- Check pile coordinates and cut-off level
- Verify depth/refusal/grout/concrete volume
- Inspect reinforcement cage or pile section
- Concrete slump/cube test where applicable
- Pile integrity/load test record accepted

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Driven Pile completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Pile deviation
- Bore collapse or obstruction
- Concrete/grout quality issue
- Testing failure

## STR-003 — Micro Pile
**Template Name:** Micro Pile Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piling drawing and coordinates
2. Survey setting out and mark pile position
3. Mobilize piling rig and prepare working platform
4. Execute drilling/driving/micropile installation
5. Install reinforcement/casing/grout as applicable
6. Place concrete or grout to approved level
7. Record installation data and as-built location
8. Carry out required pile testing
9. Submit pile record and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Piling rig / drilling machine
- Crane or lifting equipment
- Surveyor
- Concrete/grout supply
- QA/QC inspector

### QA/QC Checklist
- Check pile coordinates and cut-off level
- Verify depth/refusal/grout/concrete volume
- Inspect reinforcement cage or pile section
- Concrete slump/cube test where applicable
- Pile integrity/load test record accepted

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Micro Pile completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Pile deviation
- Bore collapse or obstruction
- Concrete/grout quality issue
- Testing failure

## STR-004 — Pile Cap
**Template Name:** Pile Cap Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved foundation drawing
2. Survey setting out and excavation limit
3. Prepare formation level and blinding
4. Install formwork or edge shutter
5. Fix reinforcement and embedded items
6. MEP/earthing/sleeve coordination check
7. Request rebar/formwork inspection
8. Cast concrete
9. Cure concrete and remove formwork
10. Survey as-built and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Excavator as required
- Carpenter/formwork crew
- Rebar crew
- Concrete pump
- Vibrator
- QA/QC inspector

### QA/QC Checklist
- Check formation level and bearing condition
- Verify rebar size, spacing, cover, laps, chairs
- Check embedded items and sleeves
- Concrete slump/cube test
- Curing record completed

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Pile Cap completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Soft formation
- Rebar congestion
- Wrong cover
- Cold joint during casting

## STR-005 — Raft Foundation
**Template Name:** Raft Foundation Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved foundation drawing
2. Survey setting out and excavation limit
3. Prepare formation level and blinding
4. Install formwork or edge shutter
5. Fix reinforcement and embedded items
6. MEP/earthing/sleeve coordination check
7. Request rebar/formwork inspection
8. Cast concrete
9. Cure concrete and remove formwork
10. Survey as-built and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Excavator as required
- Carpenter/formwork crew
- Rebar crew
- Concrete pump
- Vibrator
- QA/QC inspector

### QA/QC Checklist
- Check formation level and bearing condition
- Verify rebar size, spacing, cover, laps, chairs
- Check embedded items and sleeves
- Concrete slump/cube test
- Curing record completed

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Raft Foundation completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Soft formation
- Rebar congestion
- Wrong cover
- Cold joint during casting

## STR-006 — Strip Footing
**Template Name:** Strip Footing Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved foundation drawing
2. Survey setting out and excavation limit
3. Prepare formation level and blinding
4. Install formwork or edge shutter
5. Fix reinforcement and embedded items
6. MEP/earthing/sleeve coordination check
7. Request rebar/formwork inspection
8. Cast concrete
9. Cure concrete and remove formwork
10. Survey as-built and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Excavator as required
- Carpenter/formwork crew
- Rebar crew
- Concrete pump
- Vibrator
- QA/QC inspector

### QA/QC Checklist
- Check formation level and bearing condition
- Verify rebar size, spacing, cover, laps, chairs
- Check embedded items and sleeves
- Concrete slump/cube test
- Curing record completed

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Strip Footing completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Soft formation
- Rebar congestion
- Wrong cover
- Cold joint during casting

## STR-007 — Pad Footing
**Template Name:** Pad Footing Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved foundation drawing
2. Survey setting out and excavation limit
3. Prepare formation level and blinding
4. Install formwork or edge shutter
5. Fix reinforcement and embedded items
6. MEP/earthing/sleeve coordination check
7. Request rebar/formwork inspection
8. Cast concrete
9. Cure concrete and remove formwork
10. Survey as-built and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Excavator as required
- Carpenter/formwork crew
- Rebar crew
- Concrete pump
- Vibrator
- QA/QC inspector

### QA/QC Checklist
- Check formation level and bearing condition
- Verify rebar size, spacing, cover, laps, chairs
- Check embedded items and sleeves
- Concrete slump/cube test
- Curing record completed

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Pad Footing completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Soft formation
- Rebar congestion
- Wrong cover
- Cold joint during casting

## STR-008 — Ground Beam
**Template Name:** Ground Beam Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved foundation drawing
2. Survey setting out and excavation limit
3. Prepare formation level and blinding
4. Install formwork or edge shutter
5. Fix reinforcement and embedded items
6. MEP/earthing/sleeve coordination check
7. Request rebar/formwork inspection
8. Cast concrete
9. Cure concrete and remove formwork
10. Survey as-built and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Excavator as required
- Carpenter/formwork crew
- Rebar crew
- Concrete pump
- Vibrator
- QA/QC inspector

### QA/QC Checklist
- Check formation level and bearing condition
- Verify rebar size, spacing, cover, laps, chairs
- Check embedded items and sleeves
- Concrete slump/cube test
- Curing record completed

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Ground Beam completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Soft formation
- Rebar congestion
- Wrong cover
- Cold joint during casting

## STR-009 — Tie Beam
**Template Name:** Tie Beam Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved foundation drawing
2. Survey setting out and excavation limit
3. Prepare formation level and blinding
4. Install formwork or edge shutter
5. Fix reinforcement and embedded items
6. MEP/earthing/sleeve coordination check
7. Request rebar/formwork inspection
8. Cast concrete
9. Cure concrete and remove formwork
10. Survey as-built and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Excavator as required
- Carpenter/formwork crew
- Rebar crew
- Concrete pump
- Vibrator
- QA/QC inspector

### QA/QC Checklist
- Check formation level and bearing condition
- Verify rebar size, spacing, cover, laps, chairs
- Check embedded items and sleeves
- Concrete slump/cube test
- Curing record completed

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Tie Beam completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Soft formation
- Rebar congestion
- Wrong cover
- Cold joint during casting

## STR-010 — Foundation Slab
**Template Name:** Foundation Slab Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved foundation drawing
2. Survey setting out and excavation limit
3. Prepare formation level and blinding
4. Install formwork or edge shutter
5. Fix reinforcement and embedded items
6. MEP/earthing/sleeve coordination check
7. Request rebar/formwork inspection
8. Cast concrete
9. Cure concrete and remove formwork
10. Survey as-built and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Excavator as required
- Carpenter/formwork crew
- Rebar crew
- Concrete pump
- Vibrator
- QA/QC inspector

### QA/QC Checklist
- Check formation level and bearing condition
- Verify rebar size, spacing, cover, laps, chairs
- Check embedded items and sleeves
- Concrete slump/cube test
- Curing record completed

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Foundation Slab completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Soft formation
- Rebar congestion
- Wrong cover
- Cold joint during casting

## STR-011 — Retaining Wall
**Template Name:** Retaining Wall Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Retaining Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-012 — Diaphragm Wall
**Template Name:** Diaphragm Wall Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Diaphragm Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-013 — Soldier Pile Wall
**Template Name:** Soldier Pile Wall Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Soldier Pile Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-014 — Column
**Template Name:** Column Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Column completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-015 — Shear Wall
**Template Name:** Shear Wall Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Shear Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-016 — Core Wall
**Template Name:** Core Wall Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Core Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-017 — Beam
**Template Name:** Beam Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Beam completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-018 — Transfer Beam
**Template Name:** Transfer Beam Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Transfer Beam completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-019 — Slab
**Template Name:** Slab Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Slab completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-020 — Flat Slab
**Template Name:** Flat Slab Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Flat Slab completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-021 — Post-Tension Slab
**Template Name:** Post-Tension Slab Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Post-Tension Slab completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-022 — Precast Slab
**Template Name:** Precast Slab Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Precast Slab completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-023 — Staircase
**Template Name:** Staircase Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Staircase completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-024 — Ramp
**Template Name:** Ramp Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Ramp completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-025 — Roof Slab
**Template Name:** Roof Slab Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Roof Slab completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-026 — Structural Steel Column
**Template Name:** Structural Steel Column Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Structural Steel Column completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-027 — Structural Steel Beam
**Template Name:** Structural Steel Beam Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Structural Steel Beam completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-028 — Truss
**Template Name:** Truss Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing
2. Check material certificate and delivery
3. Survey setting out and anchor positions
4. Fabricate/prepare steel member or plate
5. Install/lift member into position
6. Align, level, plumb and temporarily brace
7. Bolt/weld/fix connection
8. Inspect connection and coating
9. Final torque/weld/NDT check where required
10. Submit installation record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Steel erector team
- Crane/manlift
- Welding machine
- Torque wrench
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check steel grade and certificates
- Verify bolt grade, torque, and washer arrangement
- Check weld visual/NDT if required
- Check alignment and plumbness
- Coating/galvanizing damage touch-up

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Truss completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Misaligned anchors
- Unsafe lifting
- Poor welding/bolting
- Coating damage

## STR-029 — Bracing
**Template Name:** Bracing Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing
2. Check material certificate and delivery
3. Survey setting out and anchor positions
4. Fabricate/prepare steel member or plate
5. Install/lift member into position
6. Align, level, plumb and temporarily brace
7. Bolt/weld/fix connection
8. Inspect connection and coating
9. Final torque/weld/NDT check where required
10. Submit installation record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Steel erector team
- Crane/manlift
- Welding machine
- Torque wrench
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check steel grade and certificates
- Verify bolt grade, torque, and washer arrangement
- Check weld visual/NDT if required
- Check alignment and plumbness
- Coating/galvanizing damage touch-up

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Bracing completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Misaligned anchors
- Unsafe lifting
- Poor welding/bolting
- Coating damage

## STR-030 — Anchor Bolt
**Template Name:** Anchor Bolt Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing
2. Check material certificate and delivery
3. Survey setting out and anchor positions
4. Fabricate/prepare steel member or plate
5. Install/lift member into position
6. Align, level, plumb and temporarily brace
7. Bolt/weld/fix connection
8. Inspect connection and coating
9. Final torque/weld/NDT check where required
10. Submit installation record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Steel erector team
- Crane/manlift
- Welding machine
- Torque wrench
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check steel grade and certificates
- Verify bolt grade, torque, and washer arrangement
- Check weld visual/NDT if required
- Check alignment and plumbness
- Coating/galvanizing damage touch-up

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Anchor Bolt completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Misaligned anchors
- Unsafe lifting
- Poor welding/bolting
- Coating damage

## STR-031 — Base Plate
**Template Name:** Base Plate Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing
2. Check material certificate and delivery
3. Survey setting out and anchor positions
4. Fabricate/prepare steel member or plate
5. Install/lift member into position
6. Align, level, plumb and temporarily brace
7. Bolt/weld/fix connection
8. Inspect connection and coating
9. Final torque/weld/NDT check where required
10. Submit installation record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Steel erector team
- Crane/manlift
- Welding machine
- Torque wrench
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check steel grade and certificates
- Verify bolt grade, torque, and washer arrangement
- Check weld visual/NDT if required
- Check alignment and plumbness
- Coating/galvanizing damage touch-up

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Base Plate completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Misaligned anchors
- Unsafe lifting
- Poor welding/bolting
- Coating damage

## STR-032 — Rebar Reinforcement
**Template Name:** Rebar Reinforcement Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review bar bending schedule
2. Receive and inspect rebar material
3. Cut and bend bars
4. Fix rebar according to drawing
5. Install spacer/chair and coupler if required
6. Check lap/anchorage/cover
7. Request rebar inspection
8. Rectify comments
9. Release for concrete casting

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Site engineer / supervisor
- Skilled workers
- Survey tools
- Lifting/temporary works as required

### QA/QC Checklist
- Verify setting out and dimensions
- Check line, level, plumb, and tolerance
- Confirm approved materials before installation
- Record inspection result before closing task

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Rebar Reinforcement completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong location or dimension
- Unapproved material or drawing revision
- Poor workmanship causing rework

## STR-033 — Formwork
**Template Name:** Formwork Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review formwork drawing and method
2. Prepare formwork material
3. Install formwork and supports
4. Apply release agent
5. Check line, level, plumb and dimensions
6. Provide access and safety protection
7. Request inspection
8. Maintain during concreting
9. Strip after approval and clean for reuse

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Site engineer / supervisor
- Skilled workers
- Survey tools
- Lifting/temporary works as required

### QA/QC Checklist
- Verify setting out and dimensions
- Check line, level, plumb, and tolerance
- Confirm approved materials before installation
- Record inspection result before closing task

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Formwork completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong location or dimension
- Unapproved material or drawing revision
- Poor workmanship causing rework

## STR-034 — Embedded Plate
**Template Name:** Embedded Plate Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing
2. Check material certificate and delivery
3. Survey setting out and anchor positions
4. Fabricate/prepare steel member or plate
5. Install/lift member into position
6. Align, level, plumb and temporarily brace
7. Bolt/weld/fix connection
8. Inspect connection and coating
9. Final torque/weld/NDT check where required
10. Submit installation record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Steel erector team
- Crane/manlift
- Welding machine
- Torque wrench
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check steel grade and certificates
- Verify bolt grade, torque, and washer arrangement
- Check weld visual/NDT if required
- Check alignment and plumbness
- Coating/galvanizing damage touch-up

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Embedded Plate completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Misaligned anchors
- Unsafe lifting
- Poor welding/bolting
- Coating damage

## STR-035 — Expansion Joint
**Template Name:** Expansion Joint Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved joint detail
2. Set out joint location
3. Prepare substrate/former
4. Install waterstop/dowel/sealant system
5. Protect joint during adjacent works
6. Inspect joint before covering
7. Record as-built and close

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Site engineer / supervisor
- Skilled workers
- Survey tools
- Lifting/temporary works as required

### QA/QC Checklist
- Verify setting out and dimensions
- Check line, level, plumb, and tolerance
- Confirm approved materials before installation
- Record inspection result before closing task

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Expansion Joint completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong location or dimension
- Unapproved material or drawing revision
- Poor workmanship causing rework

## STR-036 — Construction Joint
**Template Name:** Construction Joint Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved joint detail
2. Set out joint location
3. Prepare substrate/former
4. Install waterstop/dowel/sealant system
5. Protect joint during adjacent works
6. Inspect joint before covering
7. Record as-built and close

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Site engineer / supervisor
- Skilled workers
- Survey tools
- Lifting/temporary works as required

### QA/QC Checklist
- Verify setting out and dimensions
- Check line, level, plumb, and tolerance
- Confirm approved materials before installation
- Record inspection result before closing task

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Construction Joint completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong location or dimension
- Unapproved material or drawing revision
- Poor workmanship causing rework

## STR-037 — Parapet Structure
**Template Name:** Parapet Structure Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Parapet Structure completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-038 — Water Tank Structure
**Template Name:** Water Tank Structure Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Water Tank Structure completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-039 — Lift Pit
**Template Name:** Lift Pit Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Lift Pit completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

## STR-040 — Sump Pit
**Template Name:** Sump Pit Work Package  
**Discipline:** STR  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved structural drawing
2. Survey setting out and control line
3. Install formwork/support system
4. Fix reinforcement and couplers/anchors
5. Coordinate openings, sleeves, embeds
6. Request pre-pour inspection
7. Cast concrete
8. Cure concrete
9. Strip formwork after approval
10. Repair defects and close inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Formwork crew
- Rebar crew
- Concrete pump/bucket
- Vibrator
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Check dimensions, line, level and verticality
- Verify rebar size, spacing, lap, anchorage and cover
- Check formwork stability and cleanliness
- Concrete slump/cube test
- Surface defect inspection after stripping

### Required Documents
- Approved structural drawing
- Method statement
- Inspection and Test Plan (ITP)
- Material approval / test certificates
- QA/QC checklist

### Deliverable / Done Criteria
- Sump Pit completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Honeycomb or segregation
- Wrong rebar/detailing
- Formwork movement
- Opening/sleeve clash

---

# ARC Task Templates

## ARC-001 — Brick Wall
**Template Name:** Brick Wall Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout drawing
2. Confirm material approval
3. Set out wall line/openings
4. Prepare substrate/base
5. Install wall/block/partition system
6. Install lintel/support/accessories if required
7. Check alignment and level
8. Cure or allow fixing to set
9. Prepare for finish/inspection
10. Close work area record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Wall line and thickness checked
- Opening size and location checked
- Verticality/plumb tolerance checked
- Joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Brick Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-002 — Block Wall
**Template Name:** Block Wall Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout drawing
2. Confirm material approval
3. Set out wall line/openings
4. Prepare substrate/base
5. Install wall/block/partition system
6. Install lintel/support/accessories if required
7. Check alignment and level
8. Cure or allow fixing to set
9. Prepare for finish/inspection
10. Close work area record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Wall line and thickness checked
- Opening size and location checked
- Verticality/plumb tolerance checked
- Joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Block Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-003 — Partition Wall
**Template Name:** Partition Wall Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout drawing
2. Confirm material approval
3. Set out wall line/openings
4. Prepare substrate/base
5. Install wall/block/partition system
6. Install lintel/support/accessories if required
7. Check alignment and level
8. Cure or allow fixing to set
9. Prepare for finish/inspection
10. Close work area record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Wall line and thickness checked
- Opening size and location checked
- Verticality/plumb tolerance checked
- Joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Partition Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-004 — Curtain Wall
**Template Name:** Curtain Wall Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout drawing
2. Confirm material approval
3. Set out wall line/openings
4. Prepare substrate/base
5. Install wall/block/partition system
6. Install lintel/support/accessories if required
7. Check alignment and level
8. Cure or allow fixing to set
9. Prepare for finish/inspection
10. Close work area record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Wall line and thickness checked
- Opening size and location checked
- Verticality/plumb tolerance checked
- Joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Curtain Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-005 — Glass Wall
**Template Name:** Glass Wall Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout drawing
2. Confirm material approval
3. Set out wall line/openings
4. Prepare substrate/base
5. Install wall/block/partition system
6. Install lintel/support/accessories if required
7. Check alignment and level
8. Cure or allow fixing to set
9. Prepare for finish/inspection
10. Close work area record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Wall line and thickness checked
- Opening size and location checked
- Verticality/plumb tolerance checked
- Joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Glass Wall completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-006 — Cladding
**Template Name:** Cladding Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved façade/shop drawing
2. Check material/sample approval
3. Survey opening/support structure
4. Install brackets/anchors
5. Install frame/subframe
6. Install panels/glass/louvers
7. Apply sealant/gasket/flashing
8. Waterproofing/interface check
9. Final alignment and water test if required
10. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Façade installer
- Manlift/scaffold
- Sealant tools
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Anchor pull-out/test record if required
- Alignment and joint width checked
- Sealant/gasket continuity checked
- Water test passed where applicable

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Cladding completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Water leakage
- Thermal movement not allowed
- Glass/panel damage
- Anchor failure

## ARC-007 — Plaster Finish
**Template Name:** Plaster Finish Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Plaster Finish completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-008 — Paint Finish
**Template Name:** Paint Finish Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Paint Finish completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-009 — Tile Finish
**Template Name:** Tile Finish Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Tile Finish completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-010 — Stone Finish
**Template Name:** Stone Finish Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Stone Finish completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-011 — Floor Finish
**Template Name:** Floor Finish Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Floor Finish completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-012 — Raised Floor
**Template Name:** Raised Floor Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Raised Floor completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-013 — Ceiling
**Template Name:** Ceiling Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review reflected ceiling plan
2. Confirm material approval
3. Set out ceiling level and grid
4. Install hangers/supports
5. Coordinate MEP services/openings
6. Install framing/grid
7. Install ceiling boards/panels
8. Jointing/access panel installation
9. Final alignment inspection
10. Close ceiling after MEP clearance

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Ceiling level checked
- Hanger spacing checked
- MEP clearance accepted
- Panel alignment and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Ceiling completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-014 — Suspended Ceiling
**Template Name:** Suspended Ceiling Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review reflected ceiling plan
2. Confirm material approval
3. Set out ceiling level and grid
4. Install hangers/supports
5. Coordinate MEP services/openings
6. Install framing/grid
7. Install ceiling boards/panels
8. Jointing/access panel installation
9. Final alignment inspection
10. Close ceiling after MEP clearance

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Ceiling level checked
- Hanger spacing checked
- MEP clearance accepted
- Panel alignment and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Suspended Ceiling completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-015 — Gypsum Ceiling
**Template Name:** Gypsum Ceiling Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review reflected ceiling plan
2. Confirm material approval
3. Set out ceiling level and grid
4. Install hangers/supports
5. Coordinate MEP services/openings
6. Install framing/grid
7. Install ceiling boards/panels
8. Jointing/access panel installation
9. Final alignment inspection
10. Close ceiling after MEP clearance

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Ceiling level checked
- Hanger spacing checked
- MEP clearance accepted
- Panel alignment and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Gypsum Ceiling completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-016 — Acoustic Ceiling
**Template Name:** Acoustic Ceiling Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review reflected ceiling plan
2. Confirm material approval
3. Set out ceiling level and grid
4. Install hangers/supports
5. Coordinate MEP services/openings
6. Install framing/grid
7. Install ceiling boards/panels
8. Jointing/access panel installation
9. Final alignment inspection
10. Close ceiling after MEP clearance

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Ceiling level checked
- Hanger spacing checked
- MEP clearance accepted
- Panel alignment and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Acoustic Ceiling completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-017 — Door
**Template Name:** Door Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved schedule/shop drawing
2. Check delivered frame/leaf/glass/hardware
3. Verify opening size and readiness
4. Install frame
5. Align, plumb and fix anchors
6. Install leaf/glass/accessories
7. Apply sealant/grout
8. Install hardware/ironmongery
9. Functional test
10. Final inspection and protection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Opening dimension checked
- Frame plumb and level checked
- Gap and swing/sliding operation checked
- Fire rating/accessory compliance if applicable

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Door completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-018 — Fire Rated Door
**Template Name:** Fire Rated Door Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved schedule/shop drawing
2. Check delivered frame/leaf/glass/hardware
3. Verify opening size and readiness
4. Install frame
5. Align, plumb and fix anchors
6. Install leaf/glass/accessories
7. Apply sealant/grout
8. Install hardware/ironmongery
9. Functional test
10. Final inspection and protection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Opening dimension checked
- Frame plumb and level checked
- Gap and swing/sliding operation checked
- Fire rating/accessory compliance if applicable

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Fire Rated Door completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-019 — Window
**Template Name:** Window Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved schedule/shop drawing
2. Check delivered frame/leaf/glass/hardware
3. Verify opening size and readiness
4. Install frame
5. Align, plumb and fix anchors
6. Install leaf/glass/accessories
7. Apply sealant/grout
8. Install hardware/ironmongery
9. Functional test
10. Final inspection and protection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Opening dimension checked
- Frame plumb and level checked
- Gap and swing/sliding operation checked
- Fire rating/accessory compliance if applicable

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Window completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-020 — Louvers
**Template Name:** Louvers Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved façade/shop drawing
2. Check material/sample approval
3. Survey opening/support structure
4. Install brackets/anchors
5. Install frame/subframe
6. Install panels/glass/louvers
7. Apply sealant/gasket/flashing
8. Waterproofing/interface check
9. Final alignment and water test if required
10. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Façade installer
- Manlift/scaffold
- Sealant tools
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Anchor pull-out/test record if required
- Alignment and joint width checked
- Sealant/gasket continuity checked
- Water test passed where applicable

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Louvers completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Water leakage
- Thermal movement not allowed
- Glass/panel damage
- Anchor failure

## ARC-021 — Handrail
**Template Name:** Handrail Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail
2. Survey fixing location
3. Check material/finish approval
4. Install brackets/posts
5. Install rail panels/member
6. Check height, spacing and alignment
7. Tighten/fix anchors
8. Touch up finish
9. Load/stability check if required
10. Final inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Height and spacing checked
- Anchor fixing checked
- Alignment and finish checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Handrail completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-022 — Guardrail
**Template Name:** Guardrail Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail
2. Survey fixing location
3. Check material/finish approval
4. Install brackets/posts
5. Install rail panels/member
6. Check height, spacing and alignment
7. Tighten/fix anchors
8. Touch up finish
9. Load/stability check if required
10. Final inspection

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Height and spacing checked
- Anchor fixing checked
- Alignment and finish checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Guardrail completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-023 — Stair Finishing
**Template Name:** Stair Finishing Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Stair Finishing completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-024 — Skirting
**Template Name:** Skirting Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Skirting completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-025 — Waterproofing
**Template Name:** Waterproofing Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail and material
2. Prepare substrate
3. Check dryness/cleanliness
4. Apply primer if required
5. Install membrane/sealant/insulation/joint cover
6. Treat corners/penetrations/laps
7. Protect installed work
8. Carry out test if required
9. Rectify leaks/defects
10. Submit warranty/test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Substrate accepted
- Lap/joint/penetration treatment checked
- Flood/water test passed where required
- Protection layer completed

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Waterproofing completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Leakage
- Poor substrate
- Puncture/damage
- Incomplete lap/detail

## ARC-026 — Roof Waterproofing
**Template Name:** Roof Waterproofing Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail and material
2. Prepare substrate
3. Check dryness/cleanliness
4. Apply primer if required
5. Install membrane/sealant/insulation/joint cover
6. Treat corners/penetrations/laps
7. Protect installed work
8. Carry out test if required
9. Rectify leaks/defects
10. Submit warranty/test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Substrate accepted
- Lap/joint/penetration treatment checked
- Flood/water test passed where required
- Protection layer completed

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Roof Waterproofing completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Leakage
- Poor substrate
- Puncture/damage
- Incomplete lap/detail

## ARC-027 — Insulation
**Template Name:** Insulation Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail and material
2. Prepare substrate
3. Check dryness/cleanliness
4. Apply primer if required
5. Install membrane/sealant/insulation/joint cover
6. Treat corners/penetrations/laps
7. Protect installed work
8. Carry out test if required
9. Rectify leaks/defects
10. Submit warranty/test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Substrate accepted
- Lap/joint/penetration treatment checked
- Flood/water test passed where required
- Protection layer completed

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Insulation completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Leakage
- Poor substrate
- Puncture/damage
- Incomplete lap/detail

## ARC-028 — Thermal Insulation
**Template Name:** Thermal Insulation Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail and material
2. Prepare substrate
3. Check dryness/cleanliness
4. Apply primer if required
5. Install membrane/sealant/insulation/joint cover
6. Treat corners/penetrations/laps
7. Protect installed work
8. Carry out test if required
9. Rectify leaks/defects
10. Submit warranty/test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Substrate accepted
- Lap/joint/penetration treatment checked
- Flood/water test passed where required
- Protection layer completed

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Thermal Insulation completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Leakage
- Poor substrate
- Puncture/damage
- Incomplete lap/detail

## ARC-029 — Acoustic Insulation
**Template Name:** Acoustic Insulation Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail and material
2. Prepare substrate
3. Check dryness/cleanliness
4. Apply primer if required
5. Install membrane/sealant/insulation/joint cover
6. Treat corners/penetrations/laps
7. Protect installed work
8. Carry out test if required
9. Rectify leaks/defects
10. Submit warranty/test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Substrate accepted
- Lap/joint/penetration treatment checked
- Flood/water test passed where required
- Protection layer completed

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Acoustic Insulation completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Leakage
- Poor substrate
- Puncture/damage
- Incomplete lap/detail

## ARC-030 — Expansion Joint Cover
**Template Name:** Expansion Joint Cover Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail and material
2. Prepare substrate
3. Check dryness/cleanliness
4. Apply primer if required
5. Install membrane/sealant/insulation/joint cover
6. Treat corners/penetrations/laps
7. Protect installed work
8. Carry out test if required
9. Rectify leaks/defects
10. Submit warranty/test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Substrate accepted
- Lap/joint/penetration treatment checked
- Flood/water test passed where required
- Protection layer completed

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Expansion Joint Cover completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Leakage
- Poor substrate
- Puncture/damage
- Incomplete lap/detail

## ARC-031 — Sealant
**Template Name:** Sealant Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved detail and material
2. Prepare substrate
3. Check dryness/cleanliness
4. Apply primer if required
5. Install membrane/sealant/insulation/joint cover
6. Treat corners/penetrations/laps
7. Protect installed work
8. Carry out test if required
9. Rectify leaks/defects
10. Submit warranty/test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Substrate accepted
- Lap/joint/penetration treatment checked
- Flood/water test passed where required
- Protection layer completed

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Sealant completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Leakage
- Poor substrate
- Puncture/damage
- Incomplete lap/detail

## ARC-032 — Façade System
**Template Name:** Façade System Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved façade/shop drawing
2. Check material/sample approval
3. Survey opening/support structure
4. Install brackets/anchors
5. Install frame/subframe
6. Install panels/glass/louvers
7. Apply sealant/gasket/flashing
8. Waterproofing/interface check
9. Final alignment and water test if required
10. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Façade installer
- Manlift/scaffold
- Sealant tools
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Anchor pull-out/test record if required
- Alignment and joint width checked
- Sealant/gasket continuity checked
- Water test passed where applicable

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Façade System completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Water leakage
- Thermal movement not allowed
- Glass/panel damage
- Anchor failure

## ARC-033 — Canopy
**Template Name:** Canopy Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved façade/shop drawing
2. Check material/sample approval
3. Survey opening/support structure
4. Install brackets/anchors
5. Install frame/subframe
6. Install panels/glass/louvers
7. Apply sealant/gasket/flashing
8. Waterproofing/interface check
9. Final alignment and water test if required
10. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Façade installer
- Manlift/scaffold
- Sealant tools
- Surveyor
- QA/QC inspector

### QA/QC Checklist
- Anchor pull-out/test record if required
- Alignment and joint width checked
- Sealant/gasket continuity checked
- Water test passed where applicable

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Canopy completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Water leakage
- Thermal movement not allowed
- Glass/panel damage
- Anchor failure

## ARC-034 — Roof Tile
**Template Name:** Roof Tile Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Roof Tile completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-035 — False Ceiling Panel
**Template Name:** False Ceiling Panel Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review reflected ceiling plan
2. Confirm material approval
3. Set out ceiling level and grid
4. Install hangers/supports
5. Coordinate MEP services/openings
6. Install framing/grid
7. Install ceiling boards/panels
8. Jointing/access panel installation
9. Final alignment inspection
10. Close ceiling after MEP clearance

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Ceiling level checked
- Hanger spacing checked
- MEP clearance accepted
- Panel alignment and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- False Ceiling Panel completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-036 — Built-in Furniture
**Template Name:** Built-in Furniture Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout/shop drawing
2. Confirm material/sample approval
3. Check site readiness
4. Set out installation location
5. Install item/system
6. Coordinate interface with finishes/MEP
7. Clean and protect work
8. Functional/visual inspection
9. Rectify comments
10. Handover

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Check approved sample/material
- Check line, level, plumb, alignment and finish
- Verify dimensions/openings/interfaces
- Final visual inspection before handover

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Built-in Furniture completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-037 — Sanitary Partition
**Template Name:** Sanitary Partition Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout/shop drawing
2. Confirm material/sample approval
3. Check site readiness
4. Set out installation location
5. Install item/system
6. Coordinate interface with finishes/MEP
7. Clean and protect work
8. Functional/visual inspection
9. Rectify comments
10. Handover

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Check approved sample/material
- Check line, level, plumb, alignment and finish
- Verify dimensions/openings/interfaces
- Final visual inspection before handover

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Sanitary Partition completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-038 — Signage
**Template Name:** Signage Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout/shop drawing
2. Confirm material/sample approval
3. Check site readiness
4. Set out installation location
5. Install item/system
6. Coordinate interface with finishes/MEP
7. Clean and protect work
8. Functional/visual inspection
9. Rectify comments
10. Handover

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Check approved sample/material
- Check line, level, plumb, alignment and finish
- Verify dimensions/openings/interfaces
- Final visual inspection before handover

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Signage completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

## ARC-039 — External Works Finishes
**Template Name:** External Works Finishes Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved finish schedule
2. Confirm approved sample/mock-up
3. Prepare substrate
4. Check level/moisture/cleanliness
5. Apply finish system
6. Control joint/edge/detail treatment
7. Protect completed finish
8. Inspect surface quality
9. Rectify defects
10. Handover area

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Finishing crew
- Tiler/painter/plasterer as applicable
- Level tools
- Protection material

### QA/QC Checklist
- Substrate approved before finish
- Sample/mock-up matched
- Flatness/levelness checked
- Color, texture and joint quality checked

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- External Works Finishes completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Poor substrate preparation
- Color mismatch
- Cracking/debonding
- Damage before handover

## ARC-040 — Landscape Elements
**Template Name:** Landscape Elements Work Package  
**Discipline:** ARC  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout/shop drawing
2. Confirm material/sample approval
3. Check site readiness
4. Set out installation location
5. Install item/system
6. Coordinate interface with finishes/MEP
7. Clean and protect work
8. Functional/visual inspection
9. Rectify comments
10. Handover

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Architectural supervisor
- Skilled trade workers
- Hand tools
- Access equipment as required

### QA/QC Checklist
- Check approved sample/material
- Check line, level, plumb, alignment and finish
- Verify dimensions/openings/interfaces
- Final visual inspection before handover

### Required Documents
- Approved architectural drawing/shop drawing
- Material approval
- Method statement
- ITP/checklist
- Manufacturer data sheet where applicable

### Deliverable / Done Criteria
- Landscape Elements completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong finish/sample
- Poor alignment
- Damage by follow-on trades

---

# MEP Task Templates

## MEP-001 — Transformer
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Transformer Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Transformer completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure

## MEP-002 — Generator
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Generator Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Generator completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure

## MEP-003 — Main Distribution Board
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Main Distribution Board Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Main Distribution Board completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure

## MEP-004 — Sub Distribution Board
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Sub Distribution Board Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Sub Distribution Board completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure

## MEP-005 — Cable Tray
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Cable Tray Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved routing/shop drawing
2. Confirm material approval
3. Set out route and support spacing
4. Install supports/brackets
5. Install tray/ladder or conduit path
6. Pull/install cable
7. Dress and secure cable
8. Terminate cable ends
9. Label cable and circuit
10. Test continuity/IR/fiber test and submit record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electricians/ELV technicians
- Cable rollers/pulling tools
- Megger/tester
- Access equipment

### QA/QC Checklist
- Support spacing and fixing checked
- Cable bend radius checked
- Cable identification checked
- Continuity/insulation/fiber test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Cable Tray completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Cable damage during pulling
- Wrong circuit identification
- Clash with other services

## MEP-006 — Cable Ladder
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Cable Ladder Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved routing/shop drawing
2. Confirm material approval
3. Set out route and support spacing
4. Install supports/brackets
5. Install tray/ladder or conduit path
6. Pull/install cable
7. Dress and secure cable
8. Terminate cable ends
9. Label cable and circuit
10. Test continuity/IR/fiber test and submit record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electricians/ELV technicians
- Cable rollers/pulling tools
- Megger/tester
- Access equipment

### QA/QC Checklist
- Support spacing and fixing checked
- Cable bend radius checked
- Cable identification checked
- Continuity/insulation/fiber test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Cable Ladder completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Cable damage during pulling
- Wrong circuit identification
- Clash with other services

## MEP-007 — Power Cable
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Power Cable Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved routing/shop drawing
2. Confirm material approval
3. Set out route and support spacing
4. Install supports/brackets
5. Install tray/ladder or conduit path
6. Pull/install cable
7. Dress and secure cable
8. Terminate cable ends
9. Label cable and circuit
10. Test continuity/IR/fiber test and submit record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electricians/ELV technicians
- Cable rollers/pulling tools
- Megger/tester
- Access equipment

### QA/QC Checklist
- Support spacing and fixing checked
- Cable bend radius checked
- Cable identification checked
- Continuity/insulation/fiber test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Power Cable completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Cable damage during pulling
- Wrong circuit identification
- Clash with other services

## MEP-008 — Lighting Fixture
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Lighting Fixture Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout and circuit drawing
2. Confirm material approval
3. Set out device/equipment location
4. Install containment/conduit/support
5. Install device/equipment
6. Connect wiring/earthing
7. Label circuit/device
8. Test operation/continuity
9. Rectify comments
10. Submit inspection and test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- MEP supervisor
- Technician crew
- Testing equipment
- Access equipment as required

### QA/QC Checklist
- Device location/height checked
- Wiring polarity/continuity checked
- Earthing checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Lighting Fixture completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with structure/architecture
- Wrong routing/location
- Failed testing/commissioning
- Poor labeling

## MEP-009 — Emergency Lighting
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Emergency Lighting Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout and circuit drawing
2. Confirm material approval
3. Set out device/equipment location
4. Install containment/conduit/support
5. Install device/equipment
6. Connect wiring/earthing
7. Label circuit/device
8. Test operation/continuity
9. Rectify comments
10. Submit inspection and test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- MEP supervisor
- Technician crew
- Testing equipment
- Access equipment as required

### QA/QC Checklist
- Device location/height checked
- Wiring polarity/continuity checked
- Earthing checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Emergency Lighting completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with structure/architecture
- Wrong routing/location
- Failed testing/commissioning
- Poor labeling

## MEP-010 — Socket Outlet
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Socket Outlet Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout and circuit drawing
2. Confirm material approval
3. Set out device/equipment location
4. Install containment/conduit/support
5. Install device/equipment
6. Connect wiring/earthing
7. Label circuit/device
8. Test operation/continuity
9. Rectify comments
10. Submit inspection and test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- MEP supervisor
- Technician crew
- Testing equipment
- Access equipment as required

### QA/QC Checklist
- Device location/height checked
- Wiring polarity/continuity checked
- Earthing checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Socket Outlet completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with structure/architecture
- Wrong routing/location
- Failed testing/commissioning
- Poor labeling

## MEP-011 — Switch
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Switch Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout and circuit drawing
2. Confirm material approval
3. Set out device/equipment location
4. Install containment/conduit/support
5. Install device/equipment
6. Connect wiring/earthing
7. Label circuit/device
8. Test operation/continuity
9. Rectify comments
10. Submit inspection and test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- MEP supervisor
- Technician crew
- Testing equipment
- Access equipment as required

### QA/QC Checklist
- Device location/height checked
- Wiring polarity/continuity checked
- Earthing checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Switch completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with structure/architecture
- Wrong routing/location
- Failed testing/commissioning
- Poor labeling

## MEP-012 — Earthing System
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Earthing System Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout and circuit drawing
2. Confirm material approval
3. Set out device/equipment location
4. Install containment/conduit/support
5. Install device/equipment
6. Connect wiring/earthing
7. Label circuit/device
8. Test operation/continuity
9. Rectify comments
10. Submit inspection and test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- MEP supervisor
- Technician crew
- Testing equipment
- Access equipment as required

### QA/QC Checklist
- Device location/height checked
- Wiring polarity/continuity checked
- Earthing checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Earthing System completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with structure/architecture
- Wrong routing/location
- Failed testing/commissioning
- Poor labeling

## MEP-013 — Lightning Protection
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Lightning Protection Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved layout and circuit drawing
2. Confirm material approval
3. Set out device/equipment location
4. Install containment/conduit/support
5. Install device/equipment
6. Connect wiring/earthing
7. Label circuit/device
8. Test operation/continuity
9. Rectify comments
10. Submit inspection and test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- MEP supervisor
- Technician crew
- Testing equipment
- Access equipment as required

### QA/QC Checklist
- Device location/height checked
- Wiring polarity/continuity checked
- Earthing checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Lightning Protection completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with structure/architecture
- Wrong routing/location
- Failed testing/commissioning
- Poor labeling

## MEP-014 — UPS System
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** UPS System Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- UPS System completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure

## MEP-015 — Solar Panel System
**System / Note:** ELECTRICAL (ELV + Power)
**Template Name:** Solar Panel System Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Solar Panel System completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure

## MEP-020 — Chiller
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Chiller Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Chiller completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-021 — Cooling Tower
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Cooling Tower Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Cooling Tower completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-022 — AHU (Air Handling Unit)
**System / Note:** MECHANICAL (HVAC)
**Template Name:** AHU (Air Handling Unit) Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- AHU (Air Handling Unit) completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-023 — FCU (Fan Coil Unit)
**System / Note:** MECHANICAL (HVAC)
**Template Name:** FCU (Fan Coil Unit) Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- FCU (Fan Coil Unit) completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-024 — Duct
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Duct Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved HVAC shop drawing
2. Confirm duct/accessory material approval
3. Set out duct route and levels
4. Install supports/hangers
5. Fabricate/install ductwork
6. Install damper/diffuser/flexible duct
7. Seal joints and insulate if required
8. Coordinate ceiling/opening closure
9. Air leakage/Balancing test if required
10. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Duct installer
- Scaffold/manlift
- Sealant/insulation tools
- Testing and balancing team

### QA/QC Checklist
- Duct size/route checked
- Support spacing checked
- Joint seal quality checked
- Airflow/balancing result accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Duct completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with ceiling/structure
- Air leakage
- Poor balancing
- Access panel missing

## MEP-025 — Flexible Duct
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Flexible Duct Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved HVAC shop drawing
2. Confirm duct/accessory material approval
3. Set out duct route and levels
4. Install supports/hangers
5. Fabricate/install ductwork
6. Install damper/diffuser/flexible duct
7. Seal joints and insulate if required
8. Coordinate ceiling/opening closure
9. Air leakage/Balancing test if required
10. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Duct installer
- Scaffold/manlift
- Sealant/insulation tools
- Testing and balancing team

### QA/QC Checklist
- Duct size/route checked
- Support spacing checked
- Joint seal quality checked
- Airflow/balancing result accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Flexible Duct completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with ceiling/structure
- Air leakage
- Poor balancing
- Access panel missing

## MEP-026 — Damper
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Damper Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved HVAC shop drawing
2. Confirm duct/accessory material approval
3. Set out duct route and levels
4. Install supports/hangers
5. Fabricate/install ductwork
6. Install damper/diffuser/flexible duct
7. Seal joints and insulate if required
8. Coordinate ceiling/opening closure
9. Air leakage/Balancing test if required
10. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Duct installer
- Scaffold/manlift
- Sealant/insulation tools
- Testing and balancing team

### QA/QC Checklist
- Duct size/route checked
- Support spacing checked
- Joint seal quality checked
- Airflow/balancing result accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Damper completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with ceiling/structure
- Air leakage
- Poor balancing
- Access panel missing

## MEP-027 — Diffuser
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Diffuser Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved HVAC shop drawing
2. Confirm duct/accessory material approval
3. Set out duct route and levels
4. Install supports/hangers
5. Fabricate/install ductwork
6. Install damper/diffuser/flexible duct
7. Seal joints and insulate if required
8. Coordinate ceiling/opening closure
9. Air leakage/Balancing test if required
10. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Duct installer
- Scaffold/manlift
- Sealant/insulation tools
- Testing and balancing team

### QA/QC Checklist
- Duct size/route checked
- Support spacing checked
- Joint seal quality checked
- Airflow/balancing result accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Diffuser completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with ceiling/structure
- Air leakage
- Poor balancing
- Access panel missing

## MEP-028 — Exhaust Fan
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Exhaust Fan Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Exhaust Fan completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-029 — Ventilation Fan
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Ventilation Fan Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Ventilation Fan completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-030 — Refrigerant Pipe
**System / Note:** MECHANICAL (HVAC)
**Template Name:** Refrigerant Pipe Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Refrigerant Pipe completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-040 — Water Tank
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Water Tank Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Water Tank completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-041 — Booster Pump
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Booster Pump Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Booster Pump completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-042 — Water Supply Pipe
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Water Supply Pipe Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Water Supply Pipe completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-043 — Drainage Pipe
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Drainage Pipe Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Drainage Pipe completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-044 — Soil Pipe
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Soil Pipe Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Soil Pipe completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-045 — Vent Pipe
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Vent Pipe Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Vent Pipe completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-046 — Floor Trap
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Floor Trap Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Floor Trap completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-047 — Cleanout
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Cleanout Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Cleanout completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-048 — Manhole
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Manhole Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Manhole completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-049 — Grease Trap
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Grease Trap Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Grease Trap completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-050 — Sewage Treatment Plant
**System / Note:** PLUMBING & DRAINAGE
**Template Name:** Sewage Treatment Plant Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Sewage Treatment Plant completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-060 — Fire Pump
**System / Note:** FIRE FIGHTING
**Template Name:** Fire Pump Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Fire Pump completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-061 — Fire Tank
**System / Note:** FIRE FIGHTING
**Template Name:** Fire Tank Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved equipment schedule/shop drawing
2. Confirm equipment approval
3. Prepare plinth/support/base and access clearance
4. Deliver and inspect equipment
5. Install and align equipment
6. Connect pipe/duct/cable/control
7. Check vibration isolation and drainage
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate/O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Mechanical engineer
- Technicians
- Lifting equipment
- Testing/commissioning tools
- Supplier specialist

### QA/QC Checklist
- Equipment rating checked
- Alignment and support checked
- Flexible connection/vibration isolation checked
- Functional performance test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Fire Tank completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong capacity
- Poor access for maintenance
- Vibration/noise issue
- Commissioning failure

## MEP-062 — Sprinkler Head
**System / Note:** FIRE FIGHTING
**Template Name:** Sprinkler Head Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Sprinkler Head completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-063 — Fire Hose Reel
**System / Note:** FIRE FIGHTING
**Template Name:** Fire Hose Reel Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Fire Hose Reel completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-064 — Hydrant
**System / Note:** FIRE FIGHTING
**Template Name:** Hydrant Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved piping/shop drawing
2. Confirm pipe/fitting/equipment approval
3. Set out route/invert/location
4. Install supports/sleeves
5. Install pipe/fitting/equipment
6. Connect to equipment/system
7. Pressure/leakage/flow test
8. Flush/clean system
9. Label and identify system
10. Submit test record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Plumbers/pipe fitters
- Threading/fusion/welding tools
- Pressure test pump
- QA/QC inspector

### QA/QC Checklist
- Pipe size/slope/invert checked
- Support spacing checked
- Pressure/leakage test passed
- Access for maintenance confirmed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Hydrant completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong slope/invert
- Leakage
- Blocked access
- Service clash

## MEP-065 — Fire Extinguisher
**System / Note:** FIRE FIGHTING
**Template Name:** Fire Extinguisher Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved MEP drawing
2. Confirm material approval
3. Prepare work area
4. Install MEP element
5. Test and commission
6. Submit inspection record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- MEP supervisor
- Technician crew
- Testing equipment
- Access equipment as required

### QA/QC Checklist
- Check approved material and rating
- Check installation location/supports/clearance
- Verify labeling and identification
- Complete testing before handover

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Fire Extinguisher completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Clash with structure/architecture
- Wrong routing/location
- Failed testing/commissioning
- Poor labeling

## MEP-066 — Fire Alarm Panel
**System / Note:** FIRE FIGHTING
**Template Name:** Fire Alarm Panel Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Fire Alarm Panel completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure

## MEP-067 — Smoke Detector
**System / Note:** FIRE FIGHTING
**Template Name:** Smoke Detector Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved ELV/fire alarm layout
2. Confirm device/material approval
3. Set out device location
4. Install containment/cabling
5. Install device/panel/interface
6. Terminate and label cables
7. Configure/address device
8. Functional test
9. Integrated system test if required
10. Submit test and commissioning record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- ELV/fire alarm technicians
- Laptop/configuration tool
- Cable tester
- Access equipment

### QA/QC Checklist
- Device location and height checked
- Cable labeling checked
- Functional test passed
- Interface/integration accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Smoke Detector completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong device address
- Poor signal/cable termination
- Interface failure
- False alarm/malfunction

## MEP-068 — Heat Detector
**System / Note:** FIRE FIGHTING
**Template Name:** Heat Detector Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved ELV/fire alarm layout
2. Confirm device/material approval
3. Set out device location
4. Install containment/cabling
5. Install device/panel/interface
6. Terminate and label cables
7. Configure/address device
8. Functional test
9. Integrated system test if required
10. Submit test and commissioning record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- ELV/fire alarm technicians
- Laptop/configuration tool
- Cable tester
- Access equipment

### QA/QC Checklist
- Device location and height checked
- Cable labeling checked
- Functional test passed
- Interface/integration accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Heat Detector completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong device address
- Poor signal/cable termination
- Interface failure
- False alarm/malfunction

## MEP-080 — CCTV Camera
**System / Note:** ELV (Low Current Systems)
**Template Name:** CCTV Camera Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved ELV/fire alarm layout
2. Confirm device/material approval
3. Set out device location
4. Install containment/cabling
5. Install device/panel/interface
6. Terminate and label cables
7. Configure/address device
8. Functional test
9. Integrated system test if required
10. Submit test and commissioning record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- ELV/fire alarm technicians
- Laptop/configuration tool
- Cable tester
- Access equipment

### QA/QC Checklist
- Device location and height checked
- Cable labeling checked
- Functional test passed
- Interface/integration accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- CCTV Camera completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong device address
- Poor signal/cable termination
- Interface failure
- False alarm/malfunction

## MEP-081 — Access Control
**System / Note:** ELV (Low Current Systems)
**Template Name:** Access Control Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved ELV/fire alarm layout
2. Confirm device/material approval
3. Set out device location
4. Install containment/cabling
5. Install device/panel/interface
6. Terminate and label cables
7. Configure/address device
8. Functional test
9. Integrated system test if required
10. Submit test and commissioning record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- ELV/fire alarm technicians
- Laptop/configuration tool
- Cable tester
- Access equipment

### QA/QC Checklist
- Device location and height checked
- Cable labeling checked
- Functional test passed
- Interface/integration accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Access Control completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong device address
- Poor signal/cable termination
- Interface failure
- False alarm/malfunction

## MEP-082 — PA System
**System / Note:** ELV (Low Current Systems)
**Template Name:** PA System Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved ELV/fire alarm layout
2. Confirm device/material approval
3. Set out device location
4. Install containment/cabling
5. Install device/panel/interface
6. Terminate and label cables
7. Configure/address device
8. Functional test
9. Integrated system test if required
10. Submit test and commissioning record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- ELV/fire alarm technicians
- Laptop/configuration tool
- Cable tester
- Access equipment

### QA/QC Checklist
- Device location and height checked
- Cable labeling checked
- Functional test passed
- Interface/integration accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- PA System completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong device address
- Poor signal/cable termination
- Interface failure
- False alarm/malfunction

## MEP-083 — Data Network Rack
**System / Note:** ELV (Low Current Systems)
**Template Name:** Data Network Rack Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Data Network Rack completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure

## MEP-084 — Telephone System
**System / Note:** ELV (Low Current Systems)
**Template Name:** Telephone System Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved ELV/fire alarm layout
2. Confirm device/material approval
3. Set out device location
4. Install containment/cabling
5. Install device/panel/interface
6. Terminate and label cables
7. Configure/address device
8. Functional test
9. Integrated system test if required
10. Submit test and commissioning record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- ELV/fire alarm technicians
- Laptop/configuration tool
- Cable tester
- Access equipment

### QA/QC Checklist
- Device location and height checked
- Cable labeling checked
- Functional test passed
- Interface/integration accepted

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Telephone System completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong device address
- Poor signal/cable termination
- Interface failure
- False alarm/malfunction

## MEP-085 — Fiber Optic Cable
**System / Note:** ELV (Low Current Systems)
**Template Name:** Fiber Optic Cable Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved routing/shop drawing
2. Confirm material approval
3. Set out route and support spacing
4. Install supports/brackets
5. Install tray/ladder or conduit path
6. Pull/install cable
7. Dress and secure cable
8. Terminate cable ends
9. Label cable and circuit
10. Test continuity/IR/fiber test and submit record

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electricians/ELV technicians
- Cable rollers/pulling tools
- Megger/tester
- Access equipment

### QA/QC Checklist
- Support spacing and fixing checked
- Cable bend radius checked
- Cable identification checked
- Continuity/insulation/fiber test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Fiber Optic Cable completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Cable damage during pulling
- Wrong circuit identification
- Clash with other services

## MEP-086 — Server Room Equipment
**System / Note:** ELV (Low Current Systems)
**Template Name:** Server Room Equipment Work Package  
**Discipline:** MEP  
**Phase:** Construction  
**Default Duration:** To be defined by quantity, location, and productivity rate
### Task Steps
1. Review approved shop drawing and load schedule
2. Confirm equipment/material approval
3. Prepare room/plinth/support and access clearance
4. Deliver and inspect equipment
5. Install equipment in position
6. Connect power/control/earthing
7. Label circuits/equipment
8. Pre-commissioning inspection
9. Testing and commissioning
10. Submit test certificate and O&M data

### Dependencies
- Step 1 FS → Step 2
- Step 2 FS → Step 3
- Step 3 FS → Step 4
- Step 4 FS → Step 5
- Step 5 FS → Step 6

### Resources
- Electrical engineer
- Electricians
- Lifting equipment
- Testing instrument
- Supplier specialist if required

### QA/QC Checklist
- Equipment rating/nameplate checked
- Clearance and ventilation checked
- Earthing/termination checked
- Functional test passed

### Required Documents
- Approved MEP drawing/shop drawing
- Material approval
- Method statement
- ITP / testing checklist
- Testing and commissioning form

### Deliverable / Done Criteria
- Server Room Equipment completed, inspected, recorded, and accepted for the selected WBS location.

### Key Risks / Control Points
- Wrong rating
- Insufficient clearance
- Unsafe energization
- Testing failure
