# Downloads

ZIPs are generated **on demand** by `server.py` and cached in
`../downloads-zips` (outside this repo so the git history stays small).

| URL | What |
|---|---|
| `/downloads/all-games.zip` | The entire archive: all 720 games + TIC-80 player (~110 MB, first build takes ~30–60 s) |
| `/downloads/<slug>.zip` | One game — e.g. `/downloads/slope-2.zip`, `/downloads/jetpac.zip` |

Pre-build everything to disk instead:

```bash
../unblocked/tools/make-zips.sh all
```
