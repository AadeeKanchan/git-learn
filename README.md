# 📘 The Ultimate Git & GitHub Master Handbook: From Zero to Advanced

> A comprehensive, production-grade guide to mastering Git version control and GitHub collaboration — from internal architecture to advanced disaster recovery.

---

## 📑 Table of Contents

1. [Architectural Mental Model: How Git Actually Works](#1-architectural-mental-model-how-git-actually-works)
2. [Setup, Identity & Productive Configurations](#2-setup-identity--productive-configurations)
3. [The Core Workflow: Staging, Commits & Diffs](#3-the-core-workflow-staging-commits--diffs)
4. [Branching & Merging Masterclass](#4-branching--merging-masterclass)
5. [The Merge Conflict Blueprint](#5-the-merge-conflict-blueprint)
6. [Remote Repositories & GitHub Team Workflows](#6-remote-repositories--github-team-workflows)
7. [The Safety Net: Undoing Mistakes & Time Travel](#7-the-safety-net-undoing-mistakes--time-travel)
8. [Advanced Superpowers: Rebase, Cherry-Pick & Reflog](#8-advanced-superpowers-rebase-cherry-pick--reflog)
9. [Pro Tools: Interactive Rebase, Bisect & Worktrees](#9-pro-tools-interactive-rebase-bisect--worktrees)
10. [Disaster Recovery Recipes ("Oh Shit, Git!")](#10-disaster-recovery-recipes-oh-shit-git)
11. [Conventional Commits & Best Practices](#11-conventional-commits--best-practices)

---

## 1. Architectural Mental Model: How Git Actually Works

Most version control systems (like SVN) store changes as **differences (deltas)** relative to a base file.
**Git thinks in snapshots.** Every time you commit, Git takes a picture of what all your files look like at that moment and stores a reference to that snapshot.

### The Three Trees (States) of Git

```
┌───────────────────────┐      git add       ┌───────────────────────┐     git commit     ┌───────────────────────┐
│   Working Directory   │ ─────────────────> │     Staging Area      │ ─────────────────> │      Repository       │
│      (Your Room)      │ <───────────────── │     (The Picture)     │ <───────────────── │     (Photo Album)     │
└───────────────────────┘    git restore     └───────────────────────┘     git reset      └───────────────────────┘
                               --staged
```

1. **Working Directory (Untracked / Modified)**: The real files on your hard drive that you edit in VS Code.
2. **Staging Area / Index (Staged)**: The staging area is a preview of your next commit. You choose precisely which files and lines join the snapshot.
3. **Repository (Committed / History)**: Git's permanent database (`.git` directory) storing immutable commit objects.

### The Internal Objects
Git stores all data inside `.git/objects` using SHA-1 (or SHA-256) hashes:
- **Blob**: The raw contents of a file (filenames and permissions are not stored in the blob).
- **Tree**: A directory listing containing filenames, permissions, and pointers to blobs or child trees.
- **Commit**: Metadata containing the author, committer, timestamp, commit message, and a pointer to the root tree and parent commit(s).
- **Annotated Tag**: A permanent pointer to a specific commit, often used for releases (e.g., `v1.0.0`).

---

## 2. Setup, Identity & Productive Configurations

### Setting Identity
```powershell
# Global configuration (applies to all repositories on your computer)
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"

# Local configuration (overrides global for just the current repo)
git config --local user.name "Work Name"
git config --local user.email "work@company.com"
```

### Essential Configurations
```powershell
# Set default initial branch name to main
git config --global init.defaultBranch main

# Handle line endings automatically (Windows = true, Mac/Linux = input)
git config --global core.autocrlf true

# Always prune deleted remote branches when fetching
git config --global fetch.prune true

# Pull using rebase by default (keeps history linear and clean)
git config --global pull.rebase true
```

### Supercharged Git Aliases
Add shortcuts to your terminal:
```powershell
git config --global alias.st "status -s"
git config --global alias.cm "commit -m"
git config --global alias.lg "log --graph --oneline --decorate --all"
```

---

## 3. The Core Workflow: Staging, Commits & Diffs

### Inspecting Status
```powershell
git status               # Detailed overview of working tree and staging area
git status -s            # Short format: '??' untracked, 'M' modified, 'A' added
```

### Selective Staging
```powershell
git add <file>           # Stage a specific file
git add .                # Stage all changes in current directory
git add -p               # Interactive patch mode: review and stage line-by-line!
```

### Mastering Diffs
```powershell
git diff                 # Difference between Working Directory and Staging Area
git diff --staged        # Difference between Staging Area and the Last Commit
git diff HEAD~1 HEAD     # Difference between the last commit and the one before it
git diff branch-a..branch-b # Difference between two branch tips
```

### Committing
```powershell
git commit -m "feat: implement user authentication"
git commit -am "fix: quick inline fix without explicit add"  # (Only for tracked files)
```

---

## 4. Branching & Merging Masterclass

A branch in Git is merely a **41-byte text file** in `.git/refs/heads/` containing the hash of a commit. Creating or switching branches is instantaneous.

```
       C --- D  (feature)
      /
A --- B         (main)
```

### Branch Management
```powershell
# Create and switch in one command
git checkout -b feature/login       # Legacy syntax
git switch -c feature/login         # Modern recommended syntax

# List branches
git branch                          # Local branches (* shows current)
git branch -a                       # Local + Remote tracking branches
git branch -v                       # Shows the last commit on each branch

# Deleting branches
git branch -d feature/login         # Safe delete (only if already merged)
git branch -D feature/login         # Force delete (discards unmerged commits)
```

### Fast-Forward Merge vs Three-Way Merge

#### 1. Fast-Forward Merge
Occurs when the target branch has no new commits since the feature branch diverged. Git simply slides the pointer forward:
```powershell
git checkout main
git merge feature/login
```

#### 2. Three-Way Merge (Non-Fast-Forward)
Occurs when both `main` and `feature` have progressed independently. Git creates a **Merge Commit** with two parents:
```powershell
git merge --no-ff feature/login    # Forces a merge commit even if fast-forward is possible
```

---

## 5. The Merge Conflict Blueprint

Conflicts occur when two branches alter the **exact same lines of code** differently.

```
<<<<<<< HEAD
  background-color: blue;        <-- What you currently have on your branch
=======
  background-color: red;         <-- What is incoming from the merging branch
>>>>>>> branch-red
```

### Resolution Workflow
1. **Identify**: Run `git status` to see conflicting files under `Unmerged paths`.
2. **Open & Edit**: Choose your code, incoming code, or combine both.
3. **Clean Up**: Remove the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
4. **Stage & Finalize**:
   ```powershell
   git add <resolved-file>
   git commit -m "merge: resolve button color conflict"
   ```
5. **Abort if stuck**:
   ```powershell
   git merge --abort             # Returns everything to the state before merging began!
   ```

---

## 6. Remote Repositories & GitHub Team Workflows

```
Local Repository                     Remote (GitHub: origin)
 [ main ]  ─────────────────────────>  [ origin/main ]
           git push origin main
 [ main ]  <─────────────────────────  [ origin/main ]
           git pull origin main
```

### Connecting Remotes
```powershell
git remote add origin https://github.com/<user>/<repo>.git
git remote -v                        # Verify remote URLs
git remote rename origin upstream    # Rename a remote
```

### Pushing & Pulling
```powershell
# First push with upstream tracking
git push -u origin main

# Standard push/pull once tracking is set
git push
git pull                             # git fetch + git merge (or rebase if configured)
git fetch origin                     # Downloads objects/refs from remote WITHOUT merging
```

### Pull Request (PR) & Open-Source Workflow
1. **Fork** the target repository to your GitHub account.
2. **Clone** your fork locally: `git clone https://github.com/<you>/<repo>.git`.
3. Add the original repository as `upstream`:
   ```powershell
   git remote add upstream https://github.com/<original-owner>/<repo>.git
   ```
4. Create a descriptive branch: `git checkout -b feature/dark-mode`.
5. Push to your fork: `git push -u origin feature/dark-mode`.
6. Go to GitHub and click **Compare & pull request**.
7. Keep your fork in sync with upstream:
   ```powershell
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

---

## 7. The Safety Net: Undoing Mistakes & Time Travel

| Goal | Command | Scope | Safe for Shared Branches? |
|---|---|---|---|
| Discard unstaged edits in a file | `git restore <file>` | Working tree | ✅ Yes |
| Discard all unstaged edits | `git restore .` | Working tree | ✅ Yes |
| Unstage a file | `git restore --staged <file>` | Staging area | ✅ Yes |
| Fix the last commit message/files | `git commit --amend` | Last commit | ⚠️ Only if unpushed |
| Stash work in progress | `git stash` / `git stash pop` | Stash queue | ✅ Yes |
| Soft undo last commit | `git reset --soft HEAD~1` | History | ⚠️ Only if unpushed |
| Hard wipe last commit & edits | `git reset --hard HEAD~1` | Working tree & history | ❌ Dangerous |
| Reverse a committed change safely | `git revert <commit-hash>` | New commit | ✅ Yes (Best for public) |

### Git Stash Deep-Dive
```powershell
git stash save "work in progress on navbar"
git stash list                       # Show all saved stashes
git stash apply stash@{0}            # Apply without removing from stash list
git stash pop                        # Apply and remove top stash
git stash drop stash@{0}             # Delete specific stash
git stash clear                      # Wipe all stashes
```

---

## 8. Advanced Superpowers: Rebase, Cherry-Pick & Reflog

### Merge vs Rebase
- **Merge**: Non-destructive, preserves historical chronology, creates extra merge commits.
- **Rebase**: Rewrites project history by replaying your commits on top of another base tip. Produces a single, clean linear timeline.

```
Before Rebase:
      D --- E  (feature)
     /
A --- B --- C  (main)

After 'git rebase main' on feature:
A --- B --- C --- D' --- E'  (feature)
```

### Cherry-Picking
Copy a specific commit from any branch into your current branch:
```powershell
git checkout main
git cherry-pick a1b2c3d             # Applies commit a1b2c3d onto main
git cherry-pick a1b2c3d..e4f5g6h    # Applies a range of commits
```

### The Reflog (The Ultimate Insurance Policy)
Git maintains a local log of where `HEAD` has been for the past 90 days. Even if you run `git reset --hard` or delete a branch, your commits are NOT lost!

```powershell
git reflog                           # Inspect every state change
git checkout -b recovered-branch HEAD@{3}  # Recover exact state from 3 actions ago
git reset --hard HEAD@{5}            # Rewind to a previous point in reflog
```

---

## 9. Pro Tools: Interactive Rebase, Bisect & Worktrees

### 1. Interactive Rebase (`git rebase -i`)
Clean up messy commit history before merging into main:
```powershell
git rebase -i HEAD~4                 # Rebase the last 4 commits
```
An editor will open with options for each commit:
- `pick` = Keep commit as is.
- `reword` = Keep commit, but edit the commit message.
- `edit` = Pause rebase to amend files/code.
- `squash` = Meld commit into previous commit and combine messages.
- `fixup` = Meld commit into previous commit and discard this commit message.
- `drop` = Delete this commit entirely.

### 2. Binary Bug Hunting with `git bisect`
Quickly find the exact commit that introduced a bug using binary search:
```powershell
git bisect start
git bisect bad                       # Current commit is broken
git bisect good v1.0.0               # v1.0.0 was working
# Git checks out intermediate commits automatically:
# Test your app, then tell Git:
git bisect good                      # (or git bisect bad)
# Git narrows down to the single offending commit!
git bisect reset                     # Exit bisect mode
```

### 3. Git Worktrees
Work on two branches at the same time in separate folders without stashing or switching:
```powershell
git worktree add ../hotfix-branch hotfix
# Now you have a parallel directory '../hotfix-branch' open simultaneously!
git worktree list
git worktree remove ../hotfix-branch
```

---

## 10. Disaster Recovery Recipes ("Oh Shit, Git!")

### Recipe 1: "I accidentally committed to main instead of a feature branch!"
```powershell
git branch feature/new-work         # 1. Create feature branch at current commit
git reset --hard origin/main        # 2. Reset local main back to remote state
git checkout feature/new-work       # 3. Your commits are safe on the feature branch!
```

### Recipe 2: "I accidentally ran `git reset --hard` and lost my code!"
```powershell
git reflog                          # Find the hash right before the reset (e.g., HEAD@{1})
git reset --hard HEAD@{1}           # Your lost code is restored!
```

### Recipe 3: "I pushed a sensitive secret/API key to GitHub!"
1. Invalidate/rotate the secret immediately in the cloud provider.
2. Remove from local tracking without deleting the file:
   ```powershell
   git rm --cached .env
   echo ".env" >> .gitignore
   git commit -m "fix: untrack .env file"
   git push
   ```
3. Use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) or `git-filter-repo` to purge historical commits if sensitive data was committed previously.

---

## 11. Conventional Commits & Best Practices

Adopt the industry-standard Conventional Commits specification:
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Standard Types:
- `feat:` A new feature for the user
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Formatting, missing semicolons, no code changes
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Updating build tasks, package manager configs, etc.

### Core Best Practices Checklist
- ✅ **Commit often, commit atomically**: One logical change per commit.
- ✅ **Write imperative commit messages**: "feat: add user login" (not "added user login").
- ✅ **Never rewrite public history**: Avoid `rebase` or `reset --hard` on branches shared with others.
- ✅ **Pull with rebase**: Run `git pull --rebase` to avoid cluttered merge diamonds.
- ✅ **Keep `.gitignore` updated**: Never commit node_modules, `.env`, binaries, or OS artifacts.

---

*Authored with ❤️ for mastering Git and GitHub.*
