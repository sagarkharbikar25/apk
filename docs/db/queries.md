# SkillSync — Candidate Selection & Matching Queries

> Plan reference: `plan/01_DATABASE.md` Section 6
> Single round-trip queries without N+1 overhead

---

## Query A: Teamless Candidates for a Team (FindTeammates)

Fetches registrants of the hackathon who are not yet part of any team, have active status, want a team, with all skills aggregated.

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
JOIN hackathon_participants hp ON hp.user_id = u.id AND hp.hackathon_id = :hackathonId
LEFT JOIN user_skills us ON us.user_id = u.id
LEFT JOIN skills s ON s.id = us.skill_id
WHERE u.is_active = TRUE
  AND u.deleted_at IS NULL
  AND p.looking_for IN ('team', 'both')
  -- User is not in any team for this hackathon
  AND NOT EXISTS (
    SELECT 1 FROM team_members tm 
    JOIN teams t ON t.id = tm.team_id
    WHERE tm.user_id = u.id 
      AND t.hackathon_id = :hackathonId 
      AND t.deleted_at IS NULL
  )
GROUP BY u.id, p.id;
```

---

## Query B: Open Teams for a Registered Student (Home Recommendations)

Fetches teams in hackathons the student registered for, where the team is not full and the student is not already a member, with required skills aggregated.

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
      DISTINCT json_build_object('id', s.id, 'name', s.name)
    ) FILTER (WHERE s.id IS NOT NULL),
    '[]'::json
  ) AS required_skills
FROM teams t
JOIN users u_creator ON u_creator.id = t.creator_id
JOIN profiles p_creator ON p_creator.user_id = u_creator.id
JOIN hackathons h ON h.id = t.hackathon_id
JOIN hackathon_participants hp ON hp.hackathon_id = h.id AND hp.user_id = :studentId
LEFT JOIN team_members tm ON tm.team_id = t.id
LEFT JOIN team_required_skills trs ON trs.team_id = t.id
LEFT JOIN skills s ON s.id = trs.skill_id
WHERE t.deleted_at IS NULL
  AND h.is_active = TRUE
  AND h.end_date > NOW()
  -- Student is not already in this team
  AND NOT EXISTS (
    SELECT 1 FROM team_members tm_check 
    WHERE tm_check.team_id = t.id AND tm_check.user_id = :studentId
  )
GROUP BY t.id, p_creator.id, h.max_team_size
HAVING COUNT(DISTINCT tm.user_id) < LEAST(t.max_members, h.max_team_size);
```
