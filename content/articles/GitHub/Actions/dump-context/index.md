---
title: "GitHub Actions: Print All Values from github Context"
topics:
- github
- github-actions
---

The following workflow step prints the values of all variables available in the workflow's [`github` context](https://docs.github.com/en/actions/learn-github-actions/contexts#github-context):

```yaml
      - name: Dump GitHub context
        env:
          GITHUB_CONTEXT: ${{ toJson(github) }}
        run: echo "$GITHUB_CONTEXT"
```

```tip
For easier browsing of this huge JSON structure, open job's raw log and copy the JSON to a text editor that supports JSON code folding:

![View Raw Logs](view-raw-logs.png)
```
