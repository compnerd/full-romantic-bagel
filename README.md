# full-romantic-bagel
Simple repo manifest server

This trivial service implements an XML-RPC endpoint which can serve a `stable.xml` [repo](https://gerrit.googlesource.com/git-repo) manifest for "smart syncing" functionality.  This allows us to have the ability to maintain a parallel state which is was known to previously compile (and pass tests).
