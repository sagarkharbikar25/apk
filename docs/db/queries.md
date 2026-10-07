# SkillSync — Candidate Selection & Matching Queries

> Plan reference: `plan/01_DATABASE.md` Section 6
> Single round-trip queries without N+1 overhead

---

## Query A: Teamless Candidates for a Team (FindTeammates)

Fetches registrants of the hackathon who are not yet part of any team in that hackathon, have active status (`is_active = TRUE`, `deleted_at IS NULL`), want a team (`looking_for IN ('team', 'both')`), with all skills and proficiency levels aggregated in a single round-trip.

```sql
SELECT 
  u.id AS user_id,
  p.display_name,
  p.college,
  p.bio,
  p.looking_for,
  COALESCE(
    json_agg(
      json_build_object(
        'skillId', s.id,
        'skillName', s.name,
        'category', s.category,
        'level', us.level
      )
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) AS skills
FROM users u
JOIN profiles p ON p.user_id = u.id
JOIN hackathon_registrations hr ON hr.user_id = u.id AND hr.hackathon_id = :hackathonId
LEFT JOIN user_skills us ON us.user_id = u.id
LEFT JOIN skills s ON s.id = us.skill_id
WHERE u.is_active = TRUE
  AND u.deleted_at IS NULL
  AND p.looking_for IN ('team', 'both')
  -- Fast index lookup on team_members(hackathon_id, user_id)
  AND NOT EXISTS (
    SELECT 1 FROM team_members tm 
    WHERE tm.user_id = u.id 
      AND tm.hackathon_id = :hackathonId
  )
GROUP BY u.id, p.id;
```

### Return Shape:
```json
[
  {
    "user_id": "10000000-0000-4000-a000-000000000005",
    "display_name": "David Kim",
    "college": "Georgia Tech",
    "bio": "DevOps & SRE enthusiast with Kubernetes mastery.",
    "looking_for": "both",
    "skills": [
      {
        "skillId": "...",
        "skillName": "Kubernetes",
        "category": "DevOps",
        "level": "expert"
      }
    ]
  }
]
```

---

## Query B: Open Teams for a Registered Student (Home Recommendations)

Fetches teams in hackathons the student registered for, where the team is not full (`COUNT < max_members`) and the student is not already in a team for that hackathon, with required skills and existing members' skills aggregated in a single round-trip.

```sql
SELECT 
  t.id AS team_id,
  t.name,
  t.description,
  t.max_members,
  COUNT(DISTINCT tm.user_id) AS current_member_count,
  p_creator.display_name AS creator_name,
  COALESCE(
    json_agg(
      DISTINCT json_build_object('id', s.id, 'name', s.name, 'category', s.category)
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) AS required_skills
FROM teams t
JOIN users u_creator ON u_creator.id = t.creator_id
JOIN profiles p_creator ON p_creator.user_id = u_creator.id
JOIN hackathons h ON h.id = t.hackathon_id
JOIN hackathon_registrations hr ON hr.hackathon_id = h.id AND hr.user_id = :studentId
LEFT JOIN team_members tm ON tm.team_id = t.id
LEFT JOIN team_required_skills trs ON trs.team_id = t.id
LEFT JOIN skills s ON s.id = trs.skill_id
WHERE t.deleted_at IS NULL
  AND h.is_active = TRUE
  AND h.end_date > NOW()
  -- Student is not already in ANY team for this hackathon
  AND NOT EXISTS (
    SELECT 1 FROM team_members tm_check 
    WHERE tm_check.hackathon_id = h.id AND tm_check.user_id = :studentId
  )
GROUP BY t.id, p_creator.id, h.max_team_size
HAVING COUNT(DISTINCT tm.user_id) < LEAST(t.max_members, h.max_team_size);
```

### Return Shape:
```json
[
  {
    "team_id": "20000000-0000-4000-a000-000000000002",
    "name": "CloudScale Squad",
    "description": "Building micro-frontend platforms. Looking for a DevOps engineer with Kubernetes.",
    "max_members": 4,
    "current_member_count": 2,
    "creator_name": "Sarah Jenkins",
    "required_skills": [
      {
        "id": "...",
        "name": "Kubernetes",
        "category": "DevOps"
      }
    ]
  }
]
```
