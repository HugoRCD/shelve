#!/usr/bin/env bash
# Delete Neon preview/<git-branch> database branches whose git branch is gone
# or whose pull request is closed/merged. Never touches any other Neon branch.
#
# If DELETE_GIT_BRANCH is set, delete only preview/<that branch> and exit
# (404 / missing branch is success).
set -euo pipefail

: "${NEON_API_KEY:?NEON_API_KEY is required}"
: "${NEON_PROJECT_ID:?NEON_PROJECT_ID is required}"

readonly API="https://console.neon.tech/api/v2"
deleted=0
kept=0
failed=0

is_safe_git_branch() {
  [[ "$1" =~ ^[A-Za-z0-9._/-]+$ ]]
}

neon_get() {
  curl -fsS \
    -H "Authorization: Bearer ${NEON_API_KEY}" \
    -H "Accept: application/json" \
    "${API}$1"
}

find_preview_branch() {
  local name="$1"
  local resp
  resp="$(curl -fsS -G \
    -H "Authorization: Bearer ${NEON_API_KEY}" \
    -H "Accept: application/json" \
    --data-urlencode "search=${name}" \
    --data-urlencode "limit=100" \
    "${API}/projects/${NEON_PROJECT_ID}/branches")" || return 1
  jq -c --arg name "${name}" \
    '.branches[]? | select(.name == $name) | {id, name}' <<<"${resp}"
}

delete_neon_branch() {
  local id="$1"
  local name="$2"
  local body http_code

  if [[ "${name}" != preview/* ]]; then
    echo "Refusing to delete non-preview branch: ${name}" >&2
    return 1
  fi

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
}

delete_one_preview_branch() {
  local git_branch="$1"
  local name="preview/${git_branch}"
  local row id

  if ! is_safe_git_branch "${git_branch}"; then
    echo "Refusing unsafe git branch name: ${git_branch}" >&2
    exit 1
  fi

  row="$(find_preview_branch "${name}")" || {
    echo "Failed to look up Neon branch ${name}" >&2
    exit 1
  }

  if [[ -z "${row}" ]]; then
    echo "Neon branch ${name} does not exist; skipping."
    exit 0
  fi

  id="$(jq -r '.id' <<<"${row}")"
  echo "Deleting ${name} (${id})"
  delete_neon_branch "${id}" "${name}"
  [[ "${failed}" -eq 0 ]]
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

if [[ -n "${DELETE_GIT_BRANCH:-}" ]]; then
  delete_one_preview_branch "${DELETE_GIT_BRANCH}"
  exit $?
fi

: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${GH_TOKEN:=${GITHUB_TOKEN:-}}"
: "${GH_TOKEN:?GH_TOKEN or GITHUB_TOKEN is required}"

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
  delete_neon_branch "${id}" "${name}"
done <<<"${preview_branches}"

echo "Sweep complete. deleted=${deleted} kept=${kept} failed=${failed}"
[[ "${failed}" -eq 0 ]]
