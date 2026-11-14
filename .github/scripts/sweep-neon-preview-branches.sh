#!/usr/bin/env bash
# Delete Neon preview/<git-branch> database branches whose git branch is gone
# or whose pull request is closed/merged. Never touches any other Neon branch.
set -euo pipefail

if [[ -z "${NEON_API_KEY:-}" || -z "${NEON_PROJECT_ID:-}" ]]; then
  echo "Skipping: NEON_API_KEY or NEON_PROJECT_ID is not configured"
  exit 0
fi
if [[ ! "${NEON_PROJECT_ID}" =~ ^[A-Za-z0-9-]+$ ]]; then
  echo "Refusing unexpected NEON_PROJECT_ID" >&2
  exit 1
fi

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GH_TOKEN:=${GITHUB_TOKEN:-}}"
: "${GH_TOKEN:?GH_TOKEN or GITHUB_TOKEN is required}"

readonly API="https://console.neon.tech/api/v2"
deleted=0
kept=0
failed=0

neon_get() {
  curl -fsS \
    -H "Authorization: Bearer ${NEON_API_KEY}" \
    -H "Accept: application/json" \
    "${API}$1"
}

list_preview_branches() {
  local cursor=""
  local qs resp
  while true; do
    qs="limit=100"
    if [[ -n "${cursor}" ]]; then
      qs="${qs}&cursor=$(jq -nr --arg c "${cursor}" '$c|@uri')"
    fi
    resp="$(neon_get "/projects/${NEON_PROJECT_ID}/branches?${qs}")" || return 1
    jq -e '.branches | type == "array"' >/dev/null <<<"${resp}" || return 1
    jq -c '.branches[] | select(.name | startswith("preview/")) | {id, name}' <<<"${resp}" || return 1
    cursor="$(jq -r '.pagination.next // empty' <<<"${resp}")" || return 1
    [[ -z "${cursor}" ]] && break
  done
}

in_lines() {
  local needle="$1"
  local haystack="$2"
  [[ -n "${haystack}" ]] && grep -Fxq -- "${needle}" <<<"${haystack}"
}

echo "Listing git branches in ${GITHUB_REPOSITORY}"
git_branches="$(gh api --paginate "repos/${GITHUB_REPOSITORY}/branches?per_page=100" --jq '.[].name')" || {
  echo "Failed to list git branches" >&2
  exit 1
}

echo "Listing open pull request head refs"
open_pr_heads="$(gh api --paginate "repos/${GITHUB_REPOSITORY}/pulls?state=open&per_page=100" --jq '.[].head.ref')" || {
  echo "Failed to list open pull requests" >&2
  exit 1
}

echo "Listing Neon preview/* branches in ${NEON_PROJECT_ID}"
preview_branches="$(list_preview_branches)" || {
  echo "Failed to list Neon preview branches" >&2
  exit 1
}

if [[ -z "${preview_branches}" ]]; then
  echo "No preview/* Neon branches found."
  exit 0
fi

while IFS= read -r row; do
  [[ -z "${row}" ]] && continue

  id="$(jq -r '.id' <<<"${row}")"
  name="$(jq -r '.name' <<<"${row}")"
  git_branch="${name#preview/}"

  if [[ ! "${id}" =~ ^br-[A-Za-z0-9-]+$ ]]; then
    echo "Skipping ${name} (${id}): unexpected Neon branch id"
    kept=$((kept + 1))
    continue
  fi

  if [[ "${name}" != preview/* || -z "${git_branch}" || "${git_branch}" == "${name}" ]]; then
    echo "Skipping ${name} (${id}): not a preview/* branch"
    kept=$((kept + 1))
    continue
  fi

  reason=""
  if in_lines "${git_branch}" "${open_pr_heads}"; then
    echo "Keeping ${name} (${id}): pull request is still open"
    kept=$((kept + 1))
    continue
  fi

  if ! in_lines "${git_branch}" "${git_branches}"; then
    reason="git branch '${git_branch}' no longer exists"
  else
    closed_count="$(gh pr list --repo "${GITHUB_REPOSITORY}" --head "${git_branch}" --state closed --limit 1 --json number --jq 'length')"
    if [[ "${closed_count}" -gt 0 ]]; then
      reason="pull request for '${git_branch}' is closed or merged"
    else
      echo "Keeping ${name} (${id}): git branch exists and has no closed pull request"
      kept=$((kept + 1))
      continue
    fi
  fi

  echo "Deleting ${name} (${id}): ${reason}"
  body="$(mktemp)"
  http_code="$(curl -sS -o "${body}" -w "%{http_code}" \
    -X DELETE \
    -H "Authorization: Bearer ${NEON_API_KEY}" \
    -H "Accept: application/json" \
    "${API}/projects/${NEON_PROJECT_ID}/branches/${id}")"

  if [[ "${http_code}" == "200" || "${http_code}" == "204" ]]; then
    echo "Deleted ${name} (${id})"
    deleted=$((deleted + 1))
  elif [[ "${http_code}" == "404" ]]; then
    echo "Neon branch ${name} (${id}) already gone"
  else
    echo "Failed to delete ${name} (${id}): HTTP ${http_code}" >&2
    cat "${body}" >&2 || true
    echo >&2
    failed=$((failed + 1))
  fi
  rm -f "${body}"
done <<<"${preview_branches}"

echo "Sweep complete. deleted=${deleted} kept=${kept} failed=${failed}"
[[ "${failed}" -eq 0 ]]
