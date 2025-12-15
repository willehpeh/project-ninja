# Project Ninja
   > _Because Ninja Is Not JirA_

Project Ninja is a simple, lightweight product lifecycle management tool.

Project Ninja is very much a __WORK IN PROGRESS__ and, being licensed under the GPL, provides absolutely no warranty whatsoever. It may never be fit for purpose, but I really hope it will be someday.

Currently, all you can do is move some pre-existing cards around between columns. That's it. I'm working on it.
## Running Project Ninja
Docker is required to run Project Ninja. Run the following command from the project root:

```bash
docker compose up -d --build
```
The frontend app will be available at https://localhost. The SSL certificate is self-signed, so your browser will warn you it's not a trusted certificate. You can proceed to the site by clicking "Advanced" and then "Proceed to localhost (unsafe)".
## Background

I once met a developer who felt that Jira and Azure DevOps were fit for purpose. __Once.__ 

As far as I can tell, everybody else except management _hates_ Jira and is at best ambivalent about Azure DevOps. I firmly believe that a large part of the
reason for this hatred is that they make _doing the thing right_ exceptionally hard,
and make it far too easy to do things catastrophically wrong. Be it only assigning "tickets" to individuals, estimation (hours or points, pick your poison),
enforcing title formats for work items (I have a client who does this), creating overly complex workflows…
product teams are encouraged to use these "features", utterly destroying what little hope they have left.

I started my IT career as a freelance developer, but slowly but surely I found myself helping my clients figure out their organisational issues.
Increasingly over the past few years, I've found myself longing for a really simple product lifecycle tool. Something that makes it __easy__ to apply
the practices we're all supposed to know are a better way to do things. I also want that tool to
facilitate measuring various metrics, be they DORA-style (lead time alone would be great), Lean (WIP please),
or other, team-selected success metrics, I want it to be __simple__ to measure and track these.

Hence __Project Ninja__, because Ninja Is Not JirA.

This tool is licensed under GPLv3, meaning it's FOSS and no-one (including myself) can ever change that fact. I don't want to steal market share from
Atlassian and Microsoft: I want them to __lose their undeserved cashflow__. Petty? Absolutely. Feasible? Probably not.

Still gonna try? You bet your bonnet I am.

Enjoy!
